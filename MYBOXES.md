# MYBOXES ArduPilot firmware

This repository contains the ArduPilot source snapshot and custom hardware
definitions used for MYBOXES flight controllers.

## Firmware downloads

The public firmware catalog is available at:

**https://artem2817.github.io/MYBOXES_Ardupilot/**

It lists versioned Mini and Pro releases and provides direct downloads for
Copter, Plane, Rover, H743 bootloaders and the Pro IOMCU. The catalog is rebuilt
automatically after either release workflow completes successfully.

## Supported builds

| Board | Copter | Plane | Rover | IOMCU |
| --- | :---: | :---: | :---: | :---: |
| `MyboxH743_mini` | yes | yes | yes | no |
| `MyboxH743_pro` | yes | yes | yes | STM32F103, 8 MHz, high polarity |

The authoritative target list is `CustomBoards/targets.json`.

## Local build in WSL

Build all release files for one board:

```bash
cd ~/ardupilot-4.7.1
python3 Tools/scripts/build_myboxes_release.py \
  --board MyboxH743_mini \
  --label local-test
```

For the Pro board, replace `MyboxH743_mini` with `MyboxH743_pro`. The Pro
build first builds its IOMCU firmware, copies it into the H743 firmware image,
then builds Copter, Plane and Rover.

The result is written to `dist/<label>/<board>/`. Each set contains firmware
for Copter, Plane and Rover, firmware with the bootloader, the separate H743
bootloader, a JSON manifest and SHA-256 checksums. The Pro set also contains
IOMCU `.bin`, `.apj` and `.hex` files.

## Automatic validation

The **Validate MYBOXES firmware** workflow runs automatically for every push to
`main` and for every pull request. It builds Mini and Pro in parallel, including
the Pro IOMCU, and verifies that the packaged manifest and checksum list were
created. Validation runs never create or update GitHub Releases.

If a newer commit is pushed to the same branch, the older validation run is
cancelled so that GitHub only spends time checking the latest revision.

## GitHub Releases

Open **Actions** and choose the workflow for the required board:

- **Build MyboxH743 Mini release** builds Mini Copter, Plane and Rover.
- **Build MyboxH743 Pro + IOMCU release** first builds the STM32F103 IOMCU,
  then embeds it and builds Pro Copter, Plane and Rover.

Press **Run workflow** and select:

- the ArduPilot source version, for example `4.7.1`;
- the MYBOXES revision number, for example `2`;
- the release channel: `dev`, `beta` or `stable`.

The workflow validates the values and creates the tag automatically:

- `myboxh743-mini-4.7.1-r2-dev`
- `myboxh743-pro-4.7.1-r2-beta`
- `myboxh743-pro-4.7.1-r2` for a stable release

Mini and Pro always have separate GitHub Releases. The IOMCU stays in the Pro
release so the H743 and STM32F103 firmware always come from the same source
commit. Development and beta builds are marked as pre-releases. Stable builds
are normal GitHub Releases and become the latest stable version.

Published version tags are immutable. If a tag already exists, the workflow
stops and asks for a higher revision instead of replacing tested firmware.

## Adding a board

1. Add `hwdef.dat`, `hwdef-bl.dat` and optional `defaults.parm` under
   `libraries/AP_HAL_ChibiOS/hwdef/<board>/`.
2. Give the board a symbolic ID in `Tools/AP_Bootloader/board_types.txt` and use
   that symbol in both hwdef files. GitHub Actions rejects a raw numeric ID.
3. Add the board and required vehicle types to `CustomBoards/targets.json`.
4. If the board has an IOMCU, add its build board, polarity variant and embedded
   firmware path to that target entry.
5. Build locally, flash the `*-with-bootloader.hex` image for the first install,
   and verify power, receiver input, sensors and every assigned output.

The MYBOXES board IDs are private to this repository. Reserve board IDs with
the ArduPilot project before publishing them as generally distributed
third-party boards.
