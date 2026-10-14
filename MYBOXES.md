# MYBOXES ArduPilot firmware

This repository contains the ArduPilot source snapshot and custom hardware
definitions used for MYBOXES flight controllers.

## Supported builds

| Board | Copter | Plane | Rover |
| --- | :---: | :---: | :---: |
| `MyboxH743_mini` | yes | yes | yes |

The authoritative target list is `CustomBoards/targets.json`. Add another board
to that file and to the matrix in
`.github/workflows/myboxes-firmware-release.yml` when a new hwdef is ready.

## Local build in WSL

Build all release files for one board:

```bash
cd ~/ardupilot-4.7.1
python3 Tools/scripts/build_myboxes_release.py \
  --board MyboxH743_mini \
  --label local-test
```

The result is written to `dist/local-test/MyboxH743_mini/`. Each set contains
firmware for Copter, Plane and Rover, firmware with the bootloader, the separate
bootloader, a JSON manifest and SHA-256 checksums.

## GitHub Releases

Open **Actions**, choose **Build MYBOXES firmware release**, press **Run
workflow**, enter a unique tag such as `firmware-4.7.1-r1`, and start it. The
workflow builds every board in its matrix and creates a GitHub Release. Running
the same tag again replaces its attached files after a successful rebuild.

Keep development builds marked as pre-releases. Clear that option only after
the firmware has been tested on hardware.

## Adding a board

1. Add `hwdef.dat`, `hwdef-bl.dat` and optional `defaults.parm` under
   `libraries/AP_HAL_ChibiOS/hwdef/<board>/`.
2. Give the board a symbolic ID in `Tools/AP_Bootloader/board_types.txt` and use
   that symbol in both hwdef files. GitHub Actions rejects a raw numeric ID.
3. Add the board and required vehicle types to `CustomBoards/targets.json`.
4. Add the board name to the workflow matrix.
5. Build locally, flash the `*-with-bootloader.hex` image for the first install,
   and verify power, receiver input, sensors and every assigned output.

The current `MyboxH743_mini` ID is private to this repository. Reserve a board
ID with the ArduPilot project before publishing it as a generally distributed
third-party board.
