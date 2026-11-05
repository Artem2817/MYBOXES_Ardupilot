#!/usr/bin/env python3
"""Check release routing for current and legacy firmware download models."""
# AP_FLAKE8_CLEAN
import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location('firmware_site', Path(__file__).parents[1] / 'build_firmware_site.py')
SITE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SITE)


class FirmwareCatalogTests(unittest.TestCase):
    """Keep variants separated without dropping existing public releases."""

    @staticmethod
    def release(variant, channel='dev'):
        """Create one representative release payload."""
        suffix = '' if channel == 'stable' else '-' + channel
        tag = f'myboxh743-{variant}-4.7.1-r1{suffix}'
        return {'tag_name': tag, 'html_url': f'https://github.com/example/repo/releases/tag/{tag}',
                'prerelease': channel != 'stable', 'assets': []}

    def test_all_models_and_channels(self):
        """New variant tags must not match the legacy Mini/Pro names."""
        for variant, name in SITE.BOARD_NAMES.items():
            for channel in ('dev', 'beta', 'stable'):
                with self.subTest(variant=variant, channel=channel):
                    result = SITE.normalize_release(self.release(variant, channel))
                    self.assertEqual(result['board'], variant)
                    self.assertEqual(result['board_name'], name)
                    self.assertEqual(result['channel'], channel)

    def test_hidden_and_unrelated_releases(self):
        """Drafts and unrelated tags must not enter the download catalog."""
        release = self.release('mini-v2')
        release['draft'] = True
        self.assertIsNone(SITE.normalize_release(release))
        self.assertIsNone(SITE.normalize_release(self.release('mini-v3')))

    def test_asset_roles(self):
        """Both new models retain every vehicle, bootloader and metadata link."""
        for board in ('MyboxH743_mini_v2', 'MyboxH743_mini_v2_vib'):
            for vehicle in ('copter', 'plane', 'rover'):
                for extension in ('apj', 'bin', 'hex'):
                    name = f'{board}-{vehicle}-myboxh743-mini-v2-4.7.1-r1-dev.{extension}'
                    result = SITE.classify_asset({'name': name, 'browser_download_url': 'https://example.com/file'})
                    self.assertEqual((result['component'], result['vehicle'], result['format']),
                                     ('vehicle', vehicle, extension))
            result = SITE.classify_asset({'name': f'{board}-bootloader-version.bin',
                                          'browser_download_url': 'https://example.com/bl'})
            self.assertEqual(result['component'], 'bootloader')


if __name__ == '__main__':
    unittest.main()
