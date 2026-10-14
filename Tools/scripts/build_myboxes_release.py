#!/usr/bin/env python3
"""Build firmware release assets for boards listed in CustomBoards/targets.json."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
TARGETS_FILE = ROOT / "CustomBoards" / "targets.json"
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


def build_board(board: str, vehicles: list[str], output: Path, label: str) -> None:
    hwdef_dir = ROOT / "libraries" / "AP_HAL_ChibiOS" / "hwdef" / board
    if not hwdef_dir.is_dir():
        raise FileNotFoundError(f"unknown board: {board}")

    output.mkdir(parents=True, exist_ok=True)
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

    files = sorted(path for path in output.iterdir() if path.is_file())
    manifest = {
        "release": label,
        "board": board,
        "vehicles": vehicles,
        "git_commit": git_output("rev-parse", "HEAD"),
        "git_description": git_output("describe", "--tags", "--always", "--dirty"),
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

    checksums = sorted(path for path in output.iterdir() if path.is_file())
    checksum_path = output / f"{board}-{label}-SHA256SUMS.txt"
    checksum_path.write_text(
        "".join(f"{sha256(path)}  {path.name}\n" for path in checksums),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--board", required=True)
    parser.add_argument("--label", required=True)
    parser.add_argument("--output-dir", type=Path)
    args = parser.parse_args()

    config = json.loads(TARGETS_FILE.read_text(encoding="utf-8"))
    board_config = config.get("boards", {}).get(args.board)
    if board_config is None:
        raise SystemExit(f"board {args.board!r} is not listed in {TARGETS_FILE}")

    label = safe_label(args.label)
    output = args.output_dir or ROOT / "dist" / label / args.board
    build_board(args.board, board_config["vehicles"], output.resolve(), label)


if __name__ == "__main__":
    main()
