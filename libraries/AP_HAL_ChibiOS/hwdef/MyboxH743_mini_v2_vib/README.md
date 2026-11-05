# MyboxH743_mini_v2_vib

Configuration for current MYBOX H743 Mini CAD, 2026-11-05. AI-assisted preparation.

SPI2 ICM-45686 (IMU0), SPI1 ICM-42670-P (IMU1). IMU1 is on the vibration-isolated module; its ROTATION_NONE is temporary.
Main IMU orientation is preserved as ROTATION_NONE from the existing Mini configuration.
SPA06-003 uses the SPL06 driver, main I2C1/0x76 and module I2C1/0x77.
AT7456E uses the MAX7456-compatible OSD driver on SPI4.

Do not populate main-board R35-R38. Populate module heater resistors; feedback is IMU1.
Both versions use PA15, active HIGH. BRD_HEAT_TARG=-1 disables heating by default;
set BRD_HEAT_TARG to the required temperature to enable it. Bootloader heater state is LOW.

## Ports

| Parameter | Hardware | Connector | Default |
|---|---|---|---|
| SERIAL0 | USB | J6 | USB |
| SERIAL1 | USART2, RTS/CTS | J13 | MAVLink2 |
| SERIAL2 | UART7, RTS/CTS | J7 | MAVLink2 |
| SERIAL3 | USART1 | J4 GPS1 | GPS |
| SERIAL4 | UART8 | J11 GPS2 | GPS |
| SERIAL5 | USART3 | J14 | disabled |

USART3 PD8=TX, PD9=RX. SwapTXRX is not required. SERIAL5 RX uses interrupts;
the other UART RX paths use DMA. Serial protocol selection remains configurable.
I2C_ORDER: I2C1 (internal), I2C2 (GPS1/J5), I2C4 (GPS2).
CAN1: PD0/PD1, silent PA8; CAN2: PB5/PB6, silent PD7.
No onboard compass; external compass probing remains available.

## Outputs

| PWM | Pin | Timer channel |
|---|---|---|
| 1 | PB14 | TIM1_CH2N |
| 2 | PB15 | TIM1_CH3N |
| 3 | PD13 | TIM4_CH2 |
| 4 | PD14 | TIM4_CH3 |
| 5 | PD15 | TIM4_CH4 |
| 6 | PC6 | TIM8_CH1 |
| 7 | PC7 | TIM8_CH2 |
| 8 | PA3 | TIM5_CH4 |
| 9 | PA2 | TIM5_CH3 |
| 10 | PA1 | TIM5_CH2 |
| 11 | PA0 | TIM5_CH1 |
| 12 | PE6 | TIM15_CH2 |
| 13 | PE5 | TIM15_CH1 |

Ordinary PWM and DShot use timer groups [1,2], [3,4,5], [6,7], [8,9,10,11], [12,13].
Frequency and protocol are shared inside each group. Bidirectional DShot is not enabled.
J10/1 is RCIN; J10/2 is PWM13 through J10/14 PWM1.
RCIN is PB3/TIM2_CH2; buzzer is PB4/TIM3_CH1; system tick is TIM13.
PWM timer DMA and IMU SPI DMA are dedicated.

Analog power-module pins and v2 defaults are retained: PC0 ADC10 voltage scale 21,
PC1 ADC11 current scale 83.333; pressure PC4 ADC4 SCALE(2); RSSI PC5 ADC8.
SDMMC1 uses PC8-PC12 and PD2. Green LED PE4 is active LOW.

Private board ID: 1480; bootloader/application offset 128 KiB.
Use the matching v2 bootloader, not the original Mini ID 1478.
The current revision has 13 outputs and I2C4 on PD12; recheck saved SERVO assignments.
Build validation does not replace physical signal and sensor-orientation checks.
