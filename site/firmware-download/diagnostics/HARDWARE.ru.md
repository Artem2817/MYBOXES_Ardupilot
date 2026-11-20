# Инвентаризация Maybox

Источник — текущие HWDEF; схема V2 дополнительно сверена предыдущим аудитом 2026-11-05. HWDEF не доказывает монтаж, целостность цепей или наличие внешних устройств. Встроенного компаса и отдельной SPI flash в этих определениях нет. Все MCU: STM32H743xx, 2 МиБ, HSE 8 МГц. Аппаратный идентификатор ревизии не предусмотрен; профиль выбирается при сборке.

## MyboxH743_mini

IMU: ICM-42688-P SPI1 CS PC15. IRQ не задан в HWDEF; используется опрос DRDY-регистра.

Барометры: MS5611 I2C1/0x77

| Вывод MCU | Сигнал | Конфигурация | Источник |
|---|---|---|---|
| PA11 | OTG_FS_DM | `OTG1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:29 |
| PA12 | OTG_FS_DP | `OTG1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:30 |
| PA13 | JTMS-SWDIO | `SWD` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:32 |
| PA14 | JTCK-SWCLK | `SWD` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:33 |
| PA5 | SPI1_SCK | `SPI1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:36 |
| PA6 | SPI1_MISO | `SPI1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:37 |
| PD7 | SPI1_MOSI | `SPI1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:38 |
| PC15 | IMU1_CS | `CS` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:39 |
| PB12 | MAX7456_CS | `CS` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:42 |
| PB13 | SPI2_SCK | `SPI2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:43 |
| PB14 | SPI2_MISO | `SPI2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:44 |
| PB15 | SPI2_MOSI | `SPI2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:45 |
| PB6 | I2C1_SCL | `I2C1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:51 |
| PB7 | I2C1_SDA | `I2C1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:52 |
| PB10 | I2C2_SCL | `I2C2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:55 |
| PB11 | I2C2_SDA | `I2C2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:56 |
| PC0 | BATT_VOLTAGE_SENS | `ADC1 SCALE(1)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:59 |
| PC1 | BATT_CURRENT_SENS | `ADC1 SCALE(1)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:60 |
| PC4 | PRESSURE_SENS | `ADC1 SCALE(2)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:68 |
| PC5 | RSSI_ADC | `ADC1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:71 |
| PE4 | LED1 | `OUTPUT LOW GPIO(91)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:76 |
| PA10 | USART1_RX | `USART1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:83 |
| PA9 | USART1_TX | `USART1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:84 |
| PD5 | USART2_TX | `USART2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:87 |
| PD6 | USART2_RX | `USART2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:88 |
| PD4 | USART2_RTS | `USART2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:89 |
| PD3 | USART2_CTS | `USART2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:90 |
| PB8 | UART4_RX | `UART4` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:93 |
| PB9 | UART4_TX | `UART4` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:94 |
| PE7 | UART7_RX | `UART7` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:97 |
| PE8 | UART7_TX | `UART7` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:98 |
| PE9 | UART7_RTS | `UART7` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:99 |
| PE10 | UART7_CTS | `UART7` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:100 |
| PE0 | UART8_RX | `UART8` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:103 |
| PE1 | UART8_TX | `UART8` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:104 |
| PD0 | CAN1_RX | `CAN1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:107 |
| PD1 | CAN1_TX | `CAN1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:108 |
| PB3 | GPIO_CAN1_SILENT | `OUTPUT PUSHPULL SPEED_LOW LOW GPIO(70)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:109 |
| PD10 | CAN2_TX | `CAN2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:112 |
| PD9 | CAN2_RX | `CAN2` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:113 |
| PB4 | TIM3_CH1 | `TIM3 PWM(1) GPIO(50)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:116 |
| PB5 | TIM3_CH2 | `TIM3 PWM(2) GPIO(51)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:117 |
| PC7 | TIM8_CH2 | `TIM8 PWM(3) GPIO(52)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:118 |
| PC6 | TIM8_CH1 | `TIM8 PWM(4) GPIO(53)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:119 |
| PD15 | TIM4_CH4 | `TIM4 PWM(5) GPIO(54)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:120 |
| PD14 | TIM4_CH3 | `TIM4 PWM(6) GPIO(55)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:121 |
| PE5 | TIM15_CH1 | `TIM15 PWM(7) GPIO(56)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:122 |
| PE6 | TIM15_CH2 | `TIM15 PWM(8) GPIO(57)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:123 |
| PE14 | TIM1_CH4 | `TIM1 PWM(9) GPIO(58)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:124 |
| PE13 | TIM1_CH3 | `TIM1 PWM(10) GPIO(59)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:125 |
| PE11 | TIM1_CH2 | `TIM1 PWM(11) GPIO(60)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:126 |
| PA0 | TIM5_CH1 | `TIM5 PWM(12) GPIO(61)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:127 |
| PA1 | TIM5_CH2 | `TIM5 PWM(13) GPIO(62)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:128 |
| PA2 | TIM5_CH3 | `TIM5 PWM(14) GPIO(63)` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:129 |
| PA3 | TIM2_CH4 | `TIM2 RCININT PULLDOWN LOW` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:132 |
| PC8 | SDMMC1_D0 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:139 |
| PC9 | SDMMC1_D1 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:140 |
| PC10 | SDMMC1_D2 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:141 |
| PC11 | SDMMC1_D3 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:142 |
| PC12 | SDMMC1_CK | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:143 |
| PD2 | SDMMC1_CMD | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:144 |
| PE2 | LED_SAFETY | `OUTPUT` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:178 |
| PE3 | SAFETY_IN | `INPUT PULLDOWN` | ardupilot_hwdef/MyboxH743_mini/hwdef.dat:179 |

## MyboxH743_mini_v2

IMU: ICM-45686 SPI2 CS PB12. IRQ не задан в HWDEF; используется опрос DRDY-регистра.

Барометры: SPA06-003 I2C1/0x76

| Вывод MCU | Сигнал | Конфигурация | Источник |
|---|---|---|---|
| PA11 | OTG_FS_DM | `OTG1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:13 |
| PA12 | OTG_FS_DP | `OTG1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:14 |
| PA13 | JTMS-SWDIO | `SWD` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:15 |
| PA14 | JTCK-SWCLK | `SWD` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:16 |
| PB13 | SPI2_SCK | `SPI2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:19 |
| PC2 | SPI2_MISO | `SPI2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:20 |
| PC3 | SPI2_MOSI | `SPI2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:21 |
| PB12 | IMU1_CS | `CS` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:22 |
| PA5 | SPI1_SCK | `SPI1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:25 |
| PA6 | SPI1_MISO | `SPI1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:26 |
| PA7 | SPI1_MOSI | `SPI1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:27 |
| PA4 | IMU2_CS | `CS` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:28 |
| PE12 | SPI4_SCK | `SPI4` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:31 |
| PE13 | SPI4_MISO | `SPI4` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:32 |
| PE14 | SPI4_MOSI | `SPI4` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:33 |
| PE11 | MAX7456_CS | `CS` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:34 |
| PD11 | SENSOR_PWR_EN | `OUTPUT HIGH` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:36 |
| PB8 | I2C1_SCL | `I2C1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:38 |
| PB7 | I2C1_SDA | `I2C1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:39 |
| PB10 | I2C2_SCL | `I2C2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:40 |
| PB11 | I2C2_SDA | `I2C2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:41 |
| PD12 | I2C4_SCL | `I2C4` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:42 |
| PB9 | I2C4_SDA | `I2C4` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:43 |
| PC0 | BATT_VOLTAGE_SENS | `ADC1 SCALE(1)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:49 |
| PC1 | BATT_CURRENT_SENS | `ADC1 SCALE(1)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:50 |
| PC4 | PRESSURE_SENS | `ADC1 SCALE(2)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:51 |
| PC5 | RSSI_ADC | `ADC1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:52 |
| PE4 | LED1 | `OUTPUT HIGH GPIO(91)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:64 |
| PE2 | LED_SAFETY | `OUTPUT` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:67 |
| PE3 | SAFETY_IN | `INPUT PULLDOWN` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:68 |
| PD5 | USART2_TX | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:72 |
| PD6 | USART2_RX | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:73 |
| PD4 | USART2_RTS | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:74 |
| PD3 | USART2_CTS | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:75 |
| PE8 | UART7_TX | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:76 |
| PE7 | UART7_RX | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:77 |
| PE9 | UART7_RTS | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:78 |
| PE10 | UART7_CTS | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:79 |
| PA9 | USART1_TX | `USART1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:80 |
| PA10 | USART1_RX | `USART1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:81 |
| PE1 | UART8_TX | `UART8` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:82 |
| PE0 | UART8_RX | `UART8` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:83 |
| PD8 | USART3_TX | `USART3` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:85 |
| PD9 | USART3_RX | `USART3` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:86 |
| PD0 | CAN1_RX | `CAN1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:88 |
| PD1 | CAN1_TX | `CAN1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:89 |
| PB5 | CAN2_RX | `CAN2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:90 |
| PB6 | CAN2_TX | `CAN2` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:91 |
| PA8 | GPIO_CAN1_SILENT | `OUTPUT PUSHPULL SPEED_LOW LOW GPIO(70)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:93 |
| PD7 | GPIO_CAN2_SILENT | `OUTPUT PUSHPULL SPEED_LOW LOW GPIO(71)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:94 |
| PB14 | TIM1_CH2N | `TIM1 PWM(1) GPIO(50)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:97 |
| PB15 | TIM1_CH3N | `TIM1 PWM(2) GPIO(51)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:98 |
| PD13 | TIM4_CH2 | `TIM4 PWM(3) GPIO(52)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:99 |
| PD14 | TIM4_CH3 | `TIM4 PWM(4) GPIO(53)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:100 |
| PD15 | TIM4_CH4 | `TIM4 PWM(5) GPIO(54)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:101 |
| PC6 | TIM8_CH1 | `TIM8 PWM(6) GPIO(55)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:102 |
| PC7 | TIM8_CH2 | `TIM8 PWM(7) GPIO(56)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:103 |
| PA3 | TIM5_CH4 | `TIM5 PWM(8) GPIO(57)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:104 |
| PA2 | TIM5_CH3 | `TIM5 PWM(9) GPIO(58)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:105 |
| PA1 | TIM5_CH2 | `TIM5 PWM(10) GPIO(59)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:106 |
| PA0 | TIM5_CH1 | `TIM5 PWM(11) GPIO(60)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:107 |
| PE6 | TIM15_CH2 | `TIM15 PWM(12) GPIO(61)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:108 |
| PE5 | TIM15_CH1 | `TIM15 PWM(13) GPIO(62)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:109 |
| PB3 | TIM2_CH2 | `TIM2 RCININT PULLDOWN LOW` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:110 |
| PB4 | TIM3_CH1 | `TIM3 GPIO(77) ALARM` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:112 |
| PA15 | HEATER | `OUTPUT LOW GPIO(80)` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:115 |
| PC8 | SDMMC1_D0 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:122 |
| PC9 | SDMMC1_D1 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:123 |
| PC10 | SDMMC1_D2 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:124 |
| PC11 | SDMMC1_D3 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:125 |
| PC12 | SDMMC1_CK | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:126 |
| PD2 | SDMMC1_CMD | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2/hwdef.dat:127 |

## MyboxH743_mini_v2_vib

IMU: ICM-45686 SPI2 CS PB12, ICM-42670-P SPI1 CS PA4. IRQ не задан в HWDEF; используется опрос DRDY-регистра.

Барометры: SPA06-003 I2C1/0x76, SPA06-003 I2C1/0x77

| Вывод MCU | Сигнал | Конфигурация | Источник |
|---|---|---|---|
| PA11 | OTG_FS_DM | `OTG1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:13 |
| PA12 | OTG_FS_DP | `OTG1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:14 |
| PA13 | JTMS-SWDIO | `SWD` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:15 |
| PA14 | JTCK-SWCLK | `SWD` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:16 |
| PB13 | SPI2_SCK | `SPI2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:19 |
| PC2 | SPI2_MISO | `SPI2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:20 |
| PC3 | SPI2_MOSI | `SPI2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:21 |
| PB12 | IMU1_CS | `CS` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:22 |
| PA5 | SPI1_SCK | `SPI1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:25 |
| PA6 | SPI1_MISO | `SPI1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:26 |
| PA7 | SPI1_MOSI | `SPI1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:27 |
| PA4 | IMU2_CS | `CS` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:28 |
| PE12 | SPI4_SCK | `SPI4` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:31 |
| PE13 | SPI4_MISO | `SPI4` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:32 |
| PE14 | SPI4_MOSI | `SPI4` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:33 |
| PE11 | MAX7456_CS | `CS` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:34 |
| PD11 | SENSOR_PWR_EN | `OUTPUT HIGH` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:36 |
| PB8 | I2C1_SCL | `I2C1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:38 |
| PB7 | I2C1_SDA | `I2C1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:39 |
| PB10 | I2C2_SCL | `I2C2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:40 |
| PB11 | I2C2_SDA | `I2C2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:41 |
| PD12 | I2C4_SCL | `I2C4` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:42 |
| PB9 | I2C4_SDA | `I2C4` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:43 |
| PC0 | BATT_VOLTAGE_SENS | `ADC1 SCALE(1)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:49 |
| PC1 | BATT_CURRENT_SENS | `ADC1 SCALE(1)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:50 |
| PC4 | PRESSURE_SENS | `ADC1 SCALE(2)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:51 |
| PC5 | RSSI_ADC | `ADC1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:52 |
| PE4 | LED1 | `OUTPUT HIGH GPIO(91)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:64 |
| PE2 | LED_SAFETY | `OUTPUT` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:67 |
| PE3 | SAFETY_IN | `INPUT PULLDOWN` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:68 |
| PD5 | USART2_TX | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:72 |
| PD6 | USART2_RX | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:73 |
| PD4 | USART2_RTS | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:74 |
| PD3 | USART2_CTS | `USART2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:75 |
| PE8 | UART7_TX | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:76 |
| PE7 | UART7_RX | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:77 |
| PE9 | UART7_RTS | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:78 |
| PE10 | UART7_CTS | `UART7` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:79 |
| PA9 | USART1_TX | `USART1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:80 |
| PA10 | USART1_RX | `USART1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:81 |
| PE1 | UART8_TX | `UART8` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:82 |
| PE0 | UART8_RX | `UART8` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:83 |
| PD8 | USART3_TX | `USART3` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:85 |
| PD9 | USART3_RX | `USART3` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:86 |
| PD0 | CAN1_RX | `CAN1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:88 |
| PD1 | CAN1_TX | `CAN1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:89 |
| PB5 | CAN2_RX | `CAN2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:90 |
| PB6 | CAN2_TX | `CAN2` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:91 |
| PA8 | GPIO_CAN1_SILENT | `OUTPUT PUSHPULL SPEED_LOW LOW GPIO(70)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:93 |
| PD7 | GPIO_CAN2_SILENT | `OUTPUT PUSHPULL SPEED_LOW LOW GPIO(71)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:94 |
| PB14 | TIM1_CH2N | `TIM1 PWM(1) GPIO(50)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:97 |
| PB15 | TIM1_CH3N | `TIM1 PWM(2) GPIO(51)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:98 |
| PD13 | TIM4_CH2 | `TIM4 PWM(3) GPIO(52)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:99 |
| PD14 | TIM4_CH3 | `TIM4 PWM(4) GPIO(53)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:100 |
| PD15 | TIM4_CH4 | `TIM4 PWM(5) GPIO(54)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:101 |
| PC6 | TIM8_CH1 | `TIM8 PWM(6) GPIO(55)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:102 |
| PC7 | TIM8_CH2 | `TIM8 PWM(7) GPIO(56)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:103 |
| PA3 | TIM5_CH4 | `TIM5 PWM(8) GPIO(57)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:104 |
| PA2 | TIM5_CH3 | `TIM5 PWM(9) GPIO(58)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:105 |
| PA1 | TIM5_CH2 | `TIM5 PWM(10) GPIO(59)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:106 |
| PA0 | TIM5_CH1 | `TIM5 PWM(11) GPIO(60)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:107 |
| PE6 | TIM15_CH2 | `TIM15 PWM(12) GPIO(61)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:108 |
| PE5 | TIM15_CH1 | `TIM15 PWM(13) GPIO(62)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:109 |
| PB3 | TIM2_CH2 | `TIM2 RCININT PULLDOWN LOW` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:110 |
| PB4 | TIM3_CH1 | `TIM3 GPIO(77) ALARM` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:112 |
| PA15 | HEATER | `OUTPUT LOW GPIO(80)` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:115 |
| PC8 | SDMMC1_D0 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:122 |
| PC9 | SDMMC1_D1 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:123 |
| PC10 | SDMMC1_D2 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:124 |
| PC11 | SDMMC1_D3 | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:125 |
| PC12 | SDMMC1_CK | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:126 |
| PD2 | SDMMC1_CMD | `SDMMC1` | ardupilot_hwdef/MyboxH743_mini_v2_vib/hwdef.dat:127 |
