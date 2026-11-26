#!/usr/bin/env python3
"""Build firmware release assets for boards listed in CustomBoards/targets.json."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
TARGETS_FILE = ROOT / "CustomBoards" / "targets.json"
VERSION_PATTERN = re.compile(r"FIRMWARE_VERSION\s+(\d+),(\d+),(\d+),")
VEHICLE_SOURCES = {"copter": "ArduCopter", "plane": "ArduPlane", "rover": "Rover", "sub": "ArduSub"}
VEHICLE_BINARIES = {
    "copter": "arducopter",
    "plane": "arduplane",
    "rover": "ardurover",
    "sub": "ardusub",
}


def run(*command: str) -> None:
    print("+", " ".join(command), flush=True)
    subprocess.run(command, cwd=ROOT, check=True)


def git_output(*args: str) -> str:
    return subprocess.check_output(
        ["git", *args], cwd=ROOT, text=True
    ).strip()


def safe_label(value: str) -> str:
    label = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-.")
    if not label:
        raise ValueError("release label contains no usable characters")
    return label


def copy_required(source: Path, destination: Path) -> None:
    if not source.is_file():
        raise FileNotFoundError(f"expected build artifact is missing: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()



def source_version(vehicles: list[str], requested: str | None = None) -> str:
    versions = set()
    for vehicle in vehicles:
        header = ROOT / VEHICLE_SOURCES[vehicle] / "version.h"
        match = VERSION_PATTERN.search(header.read_text(encoding="utf-8"))
        if match is None:
            raise ValueError(f"missing firmware version in {header}")
        versions.add(".".join(match.groups()))
    if len(versions) != 1:
        raise ValueError(f"mixed source versions: {sorted(versions)}")
    actual = versions.pop()
    if requested is not None and actual != requested:
        raise ValueError(f"release requests {requested}, source is {actual}")
    return actual


def verify_release(output: Path) -> dict[str, Any]:
    manifests = list(output.glob("*-manifest.json"))
    if len(manifests) != 1:
        raise ValueError("release must contain exactly one manifest")
    manifest = json.loads(manifests[0].read_text(encoding="utf-8"))
    names = set()
    for item in manifest["files"]:
        name = item["name"]
        if Path(name).name != name or name in names:
            raise ValueError(f"unsafe or duplicate asset: {name}")
        names.add(name)
        path = output / name
        if not path.is_file() or path.stat().st_size != item["size"] or sha256(path) != item["sha256"]:
            raise ValueError(f"manifest mismatch: {name}")
    checksum_name = f'{manifest["board"]}-{manifest["release"]}-SHA256SUMS.txt'
    checksum = output / checksum_name
    expected_names = names | {manifests[0].name}
    checksummed = set()
    for line in checksum.read_text(encoding="utf-8").splitlines():
        digest, name = line.split("  ", 1)
        if name not in expected_names or name in checksummed or sha256(output / name) != digest:
            raise ValueError(f"checksum mismatch: {name}")
        checksummed.add(name)
    if checksummed != expected_names:
        raise ValueError("checksum list does not cover every release asset")
    actual_names = {p.name for p in output.iterdir() if p.is_file()}
    if actual_names != expected_names | {checksum_name}:
        raise ValueError("unexpected files in release directory")
    return manifest


def build_iomcu(
    board: str,
    iomcu: dict[str, str],
    output: Path,
    label: str,
    compile_firmware: bool,
) -> dict[str, str]:
    iomcu_board = iomcu["board"]
    variant = iomcu["variant"]
    embedded_path = ROOT / iomcu["embedded_path"]

    if compile_firmware:
        run("./waf", "configure", "--board", iomcu_board)
        run("./waf", "iofirmware")

    build_dir = ROOT / "build" / iomcu_board / "bin"
    firmware_stem = f"iofirmware_{variant}"
    firmware_bin = build_dir / f"{firmware_stem}.bin"
    copy_required(firmware_bin, embedded_path)

    release_prefix = f"{board}-iomcu-{iomcu_board}-{variant}-{label}"
    copy_required(firmware_bin, output / f"{release_prefix}.bin")
    copy_required(
        build_dir / f"{firmware_stem}.apj",
        output / f"{release_prefix}.apj",
    )
    copy_required(
        build_dir / f"{firmware_stem}_with_bl.hex",
        output / f"{release_prefix}-with-bootloader.hex",
    )

    return {
        "board": iomcu_board,
        "variant": variant,
        "embedded_path": str(embedded_path.relative_to(ROOT)),
    }


def build_board(
    board: str,
    board_config: dict[str, Any],
    output: Path,
    label: str,
    compile_iomcu: bool,
    requested_version: str | None = None,
    require_clean: bool = False,
) -> None:
    hwdef_dir = ROOT / "libraries" / "AP_HAL_ChibiOS" / "hwdef" / board
    if not hwdef_dir.is_dir():
        raise FileNotFoundError(f"unknown board: {board}")

    version = source_version(board_config["vehicles"], requested_version)
    label_version = re.search(r"myboxh743-[a-z0-9-]+-(\d+\.\d+\.\d+)-r", label)
    if label_version and label_version.group(1) != version:
        raise ValueError("release label does not match source version")
    dirty = bool(git_output("status", "--porcelain", "--untracked-files=no"))
    if require_clean and dirty:
        raise ValueError("release source contains uncommitted tracked changes")
    source_commit = git_output("rev-parse", "HEAD")
    source_description = git_output("describe", "--tags", "--always")
    vehicles = board_config["vehicles"]

    output.mkdir(parents=True, exist_ok=True)
    # Only replace artifacts owned by this board and label; unrelated files are an error.
    expected = {f"{board}-bootloader-{label}.{ext}" for ext in ("bin", "hex")}
    for vehicle in vehicles:
        expected.update(f"{board}-{vehicle}-{label}{suffix}" for suffix in (".apj", ".bin", "-with-bootloader.hex"))
    if board_config.get("iomcu"):
        io = board_config["iomcu"]
        io_prefix = f'{board}-iomcu-{io["board"]}-{io["variant"]}-{label}'
        expected.update(io_prefix + suffix for suffix in (".bin", ".apj", "-with-bootloader.hex"))
    owned = expected | {f"{board}-{label}-manifest.json", f"{board}-{label}-SHA256SUMS.txt"}
    unexpected = [p.name for p in output.iterdir() if p.name not in owned]
    if unexpected:
        raise ValueError(f"output directory contains unrelated files: {unexpected}")
    iomcu_manifest = None
    iomcu_config = board_config.get("iomcu")
    if iomcu_config is not None:
        iomcu_manifest = build_iomcu(
            board,
            iomcu_config,
            output,
            label,
            compile_iomcu,
        )

    run(sys.executable, "Tools/scripts/build_bootloaders.py", board)
    run("./waf", "configure", "--board", board)

    for vehicle in vehicles:
        binary = VEHICLE_BINARIES.get(vehicle)
        if binary is None:
            raise ValueError(f"unsupported vehicle target: {vehicle}")
        run("./waf", vehicle)
        build_dir = ROOT / "build" / board / "bin"
        prefix = f"{board}-{vehicle}-{label}"
        copy_required(build_dir / f"{binary}.apj", output / f"{prefix}.apj")
        copy_required(build_dir / f"{binary}.bin", output / f"{prefix}.bin")
        copy_required(
            build_dir / f"{binary}_with_bl.hex",
            output / f"{prefix}-with-bootloader.hex",
        )

    bootloader_dir = ROOT / "Tools" / "bootloaders"
    copy_required(
        bootloader_dir / f"{board}_bl.bin",
        output / f"{board}-bootloader-{label}.bin",
    )
    copy_required(
        bootloader_dir / f"{board}_bl.hex",
        output / f"{board}-bootloader-{label}.hex",
    )

    files = [output / name for name in sorted(expected)]
    for path in files:
        if not path.is_file() or path.stat().st_size == 0:
            raise ValueError(f"missing or empty artifact: {path.name}")
    compiler_path = shutil.which("arm-none-eabi-gcc")
    compiler = subprocess.check_output([compiler_path, "--version"], text=True).splitlines()[0] if compiler_path else "not found"
    manifest = {
        "release": label,
        "board": board,
        "vehicles": vehicles,
        "iomcu": iomcu_manifest,
        "git_commit": source_commit,
        "git_description": source_description,
        "source_version": version,
        "source_branch": git_output("branch", "--show-current"),
        "git_dirty": dirty,
        "submodules": git_output("submodule", "status", "--recursive").splitlines(),
        "build_environment": {"compiler": compiler, "container": os.environ.get("MYBOX_BUILD_CONTAINER", "local")},
        "built_at_utc": datetime.now(timezone.utc).isoformat(),
        "files": [
            {
                "name": path.name,
                "size": path.stat().st_size,
                "sha256": sha256(path),
            }
            for path in files
        ],
    }
    manifest_path = output / f"{board}-{label}-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    checksums = sorted([*files, manifest_path])
    checksum_path = output / f"{board}-{label}-SHA256SUMS.txt"
    checksum_path.write_text(
        "".join(f"{sha256(path)}  {path.name}\n" for path in checksums),
        encoding="utf-8",
    )

    verify_release(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--board")
    parser.add_argument("--label")
    parser.add_argument("--version", help="expected version from the selected source")
    parser.add_argument("--require-clean", action="store_true")
    parser.add_argument("--verify-only", type=Path, help="verify an existing package without compiling")
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument(
        "--use-prebuilt-iomcu",
        action="store_true",
        help="package an IOMCU already built in this workspace",
    )
    args = parser.parse_args()

    if args.verify_only:
        verify_release(args.verify_only.resolve())
        print("Manifest and SHA-256 verified")
        return
    if not args.board or not args.label:
        parser.error("--board and --label are required for a build")
    config = json.loads(TARGETS_FILE.read_text(encoding="utf-8"))
    board_config = config.get("boards", {}).get(args.board)
    if board_config is None:
        raise SystemExit(f"board {args.board!r} is not listed in {TARGETS_FILE}")

    label = safe_label(args.label)
    output = args.output_dir or ROOT / "dist" / label / args.board
    build_board(
        args.board,
        board_config,
        output.resolve(),
        label,
        compile_iomcu=not args.use_prebuilt_iomcu,
        requested_version=args.version,
        require_clean=args.require_clean,
    )


if __name__ == "__main__":
    main()
