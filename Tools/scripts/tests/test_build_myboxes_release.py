# AP_FLAKE8_CLEAN
"""Package regression tests use fixtures only; no firmware build is invoked."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("mybox_release", Path(__file__).parents[1] / "build_myboxes_release.py")
release = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(release)


class PackagingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.board = "MyboxH743_mini"
        (self.root / "libraries/AP_HAL_ChibiOS/hwdef" / self.board).mkdir(parents=True)
        for vehicle, folder in release.VEHICLE_SOURCES.items():
            (self.root / folder).mkdir()
            (self.root / folder / "version.h").write_text("#define FIRMWARE_VERSION 4,7,1,0\n")
        binary = self.root / "build" / self.board / "bin"
        binary.mkdir(parents=True)
        for stem in ("arducopter", "arduplane", "ardurover"):
            for suffix in (".apj", ".bin", "_with_bl.hex"):
                (binary / (stem + suffix)).write_bytes(b"packaging fixture")
        boot = self.root / "Tools/bootloaders"
        boot.mkdir(parents=True)
        for suffix in ("_bl.bin", "_bl.hex"):
            (boot / (self.board + suffix)).write_bytes(b"bootloader fixture")
        self.output = self.root / "out"
        for name, value in (("ROOT", self.root), ("run", lambda *a: None),
                            ("git_output", lambda *a: "" if a[0] == "status" else "source-fixture")):
            manager = patch.object(release, name, value)
            manager.start()
            self.addCleanup(manager.stop)

    def package(self, **kwargs):
        release.build_board(self.board, {"vehicles": ["copter", "plane", "rover"]},
                            self.output, "myboxh743-mini-4.7.1-r99-dev", False, **kwargs)
        return release.verify_release(self.output)

    def test_repeated_packaging_has_valid_manifest_and_checksums(self):
        first = self.package()
        second = self.package()
        self.assertEqual(first["files"], second["files"])
        self.assertFalse(any("manifest" in f["name"] or "SHA256" in f["name"] for f in second["files"]))
        self.assertEqual(second["source_version"], "4.7.1")
        self.assertFalse(second["git_dirty"])

    def test_corrupt_missing_and_unlisted_assets_are_rejected(self):
        manifest = self.package()
        asset = self.output / manifest["files"][0]["name"]
        asset.write_bytes(b"corrupt")
        with self.assertRaisesRegex(ValueError, "manifest mismatch"):
            release.verify_release(self.output)
        self.package()
        asset.unlink()
        with self.assertRaisesRegex(ValueError, "manifest mismatch"):
            release.verify_release(self.output)
        self.package()
        (self.output / "unexpected.bin").write_bytes(b"unrelated")
        with self.assertRaisesRegex(ValueError, "unrelated files"):
            self.package()

    def test_wrong_version_and_dirty_sources_are_rejected_before_build(self):
        with patch.object(release, "run") as build:
            with self.assertRaisesRegex(ValueError, "source is"):
                self.package(requested_version="4.8.0")
            with patch.object(release, "git_output", return_value="modified"):
                with self.assertRaisesRegex(ValueError, "uncommitted"):
                    self.package(require_clean=True)
            build.assert_not_called()

    def test_checksum_list_must_cover_manifest_and_every_asset(self):
        self.package()
        sums = next(self.output.glob("*-SHA256SUMS.txt"))
        sums.write_text(sums.read_text().splitlines()[0] + "\n")
        with self.assertRaisesRegex(ValueError, "cover every"):
            release.verify_release(self.output)


if __name__ == "__main__":
    unittest.main()
