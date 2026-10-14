# MYBOXES ArduPilot firmware

This repository contains the ArduPilot source snapshot and custom hardware
definitions used for MYBOXES flight controllers.

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

## GitHub Releases

Open **Actions** and choose the workflow for the required board:

- **Build MyboxH743 Mini release** builds Mini Copter, Plane and Rover.
- **Build MyboxH743 Pro + IOMCU release** first builds the STM32F103 IOMCU,
  then embeds it and builds Pro Copter, Plane and Rover.

Press **Run workflow** and enter a unique tag, for example:

- `myboxh743-mini-4.7.1-r1`
- `myboxh743-pro-4.7.1-r1`

Mini and Pro always have separate GitHub Releases. The IOMCU stays in the Pro
release so the H743 and STM32F103 firmware always come from the same source
commit. Running the same tag again replaces that release's attached files after
a successful rebuild.

Keep development builds marked as pre-releases. Clear that option only after
the firmware has been tested on hardware.

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
