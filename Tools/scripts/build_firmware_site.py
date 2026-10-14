#!/usr/bin/env python3
"""Build the static MYBOXES firmware download catalog from GitHub Releases."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


RELEASE_TAG = re.compile(
    r"^myboxh743-(mini|pro)-([0-9]+\.[0-9]+\.[0-9]+)-r([1-9][0-9]*)(?:-(dev|beta))?$"
)
VEHICLE_PATTERN = re.compile(r"-(copter|plane|rover)-")


def github_get(url: str, token: str) -> tuple[Any, dict[str, str]]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "MYBOXES-firmware-site-builder",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response), dict(response.headers.items())
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API returned {error.code}: {body}") from error


def load_releases(repository: str, token: str) -> list[dict[str, Any]]:
    releases: list[dict[str, Any]] = []
    page = 1
    while True:
        url = (
            f"https://api.github.com/repos/{repository}/releases"
            f"?per_page=100&page={page}"
        )
        batch, _ = github_get(url, token)
        if not isinstance(batch, list):
            raise TypeError("GitHub releases response is not a list")
        releases.extend(batch)
        if len(batch) < 100:
            return releases
        page += 1


def classify_asset(asset: dict[str, Any]) -> dict[str, Any]:
    name = asset["name"]
    lower = name.lower()
    extension = Path(name).suffix.lower().lstrip(".")
    vehicle_match = VEHICLE_PATTERN.search(lower)

    if "-iomcu-" in lower:
        component = "iomcu"
    elif "-bootloader-" in lower:
        component = "bootloader"
    elif vehicle_match:
        component = "vehicle"
    else:
        component = "metadata"

    return {
        "name": name,
        "size": asset.get("size", 0),
        "download_count": asset.get("download_count", 0),
        "url": asset["browser_download_url"],
        "component": component,
        "vehicle": vehicle_match.group(1) if vehicle_match else None,
        "format": extension,
        "with_bootloader": "with-bootloader" in lower,
    }


def normalize_release(release: dict[str, Any]) -> dict[str, Any] | None:
    if release.get("draft"):
        return None
    tag = release.get("tag_name", "")
    match = RELEASE_TAG.fullmatch(tag)
    if match is None:
        return None

    board, version, revision_text, channel_suffix = match.groups()
    channel = channel_suffix
    if channel is None:
        channel = "beta" if release.get("prerelease") else "stable"

    return {
        "board": board,
        "board_name": "MyboxH743 Mini" if board == "mini" else "MyboxH743 Pro",
        "version": version,
        "revision": int(revision_text),
        "channel": channel,
        "tag": tag,
        "title": release.get("name") or tag,
        "published_at": release.get("published_at") or release.get("created_at"),
        "release_url": release["html_url"],
        "target": release.get("target_commitish", ""),
        "prerelease": bool(release.get("prerelease")),
        "assets": [classify_asset(asset) for asset in release.get("assets", [])],
    }


def version_key(release: dict[str, Any]) -> tuple[int, ...]:
    version = tuple(int(part) for part in release["version"].split("."))
    return (*version, release["revision"])


def build_catalog(repository: str, token: str) -> dict[str, Any]:
    normalized = [
        item
        for release in load_releases(repository, token)
        if (item := normalize_release(release)) is not None
    ]
    normalized.sort(key=version_key, reverse=True)
    return {
        "schema": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "repository": repository,
        "repository_url": f"https://github.com/{repository}",
        "requires_github_access": False,
        "releases": normalized,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repository", required=True)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    source = args.source.resolve()
    output = args.output.resolve()
    if not source.is_dir():
        raise FileNotFoundError(f"site source directory does not exist: {source}")
    if output == source or source in output.parents:
        raise ValueError("output must not be inside the source directory")

    token = os.environ.get("GH_TOKEN", "")
    catalog = build_catalog(args.repository, token)

    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(source, output)
    (output / "firmware-index.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (output / ".nojekyll").touch()

    print(
        f"Built firmware site with {len(catalog['releases'])} releases at {output}",
        flush=True,
    )


if __name__ == "__main__":
    main()
