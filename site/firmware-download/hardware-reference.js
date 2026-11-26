/* Independent help component. Existing catalog state and release routing are untouched. */
(() => {
  'use strict';
  const selector=document.getElementById('reference-board'), content=document.getElementById('reference-content');
  if(!selector||!content)return;
  const valid=new Set(['mini','mini-v2','mini-v2-vib','pro']);let generation=0;
  let selection={firmware:new URLSearchParams(location.search).get('firmware')||'ardupilot',line:'9',capabilities:{}};
  let selectionKey='';
  const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);return e;};
  function table(headers,rows){const wrap=node('div');wrap.className='reference-table-wrap';const t=node('table');t.className='reference-table';const head=node('thead'),tr=node('tr');headers.forEach(h=>tr.append(node('th',h)));head.append(tr);t.append(head);const body=node('tbody');rows.forEach(row=>{const r=node('tr');row.forEach(v=>r.append(node('td',v)));body.append(r);});t.append(body);wrap.append(t);return wrap;}
  function paragraph(text){content.append(node('p',text));}
  async function load(board){
    if(!valid.has(board))return;selector.value=board;const current=++generation;
    try{
      const response=await fetch(`reference/${board}.json`);if(!response.ok)throw new Error('Справка временно недоступна');const p=await response.json();if(current!==generation)return;content.replaceChildren();content.append(node('h3',p.name));
      paragraph(`${p.mcu}; HSE 8 МГц; встроенная Flash 2 МиБ. Ориентация датчиков задаётся аппаратным профилем.`);
      content.append(node('h3','PWM, серво и DShot'));
      if(board==='pro')paragraph('Pro: H743 управляет FMU-выходами; основные выходы проходят через STM32F103 IOMCU. Нельзя переносить нумерацию Mini на Pro. Обычный образ IOMCU не включает DShot; отдельный DShot-образ и его настройка проверяются по документации конкретного релиза. INAV для Pro в этом каталоге не предлагается.');
      else {
        if(selection.firmware==='inav'){
          paragraph(selection.capabilities.dshot
            ? 'Для этой версии доступны DSHOT150, DSHOT300 и DSHOT600; заводской протокол STANDARD. Для двух ESC используйте PWM1–2 и микшер с двумя моторами. Обычные сервы подключайте к PWM3–14 на Mini или PWM3–13 на v2/Vib.'
            : 'Для этого выпуска используйте обычный PWM. DShot доступен в INAV 9 с r10 и в INAV 10; при выборе старого образа сверяйтесь с его описанием.');
          if(selection.capabilities.dshot)paragraph('PWM5 и PWM8 на Mini, PWM5 и PWM12 на v2/Vib оставляйте с обычным PWM: у этих каналов нет отдельного DMA-запроса.');
          if(selection.capabilities.escTelemetry)paragraph('Для RPM нужен совместимый телеметрический выход ESC на RX свободного UART и общий GND. В Ports выберите ESC output/telemetry. Двунаправленный DShot в этой сборке INAV не используется.');
        }else{
          paragraph('ArduPilot: назначьте функции моторов и серв для выбранного типа аппарата. Протокол и частота связаны с аппаратной группой таймера. Для двух ESC на PWM1–2 обычные сервы можно размещать начиная с PWM3; питание серв подаётся отдельно.');
          paragraph('DShot включается настройками ArduPilot для поддерживаемых выходов. Перед смешением протоколов сверяйте группы таймеров в таблице ниже и описание своего выпуска.');
        }
      }
      const groups={};(p.outputs||[]).forEach(o=>{const timer=o.timer.split('_')[0];(groups[timer]??=[]).push(o.channel);});
      content.append(table(['Выход','Вывод MCU','Таймер','Контакт / примечание'],(p.outputs||[]).map(o=>[p.board==='pro'?`FMU ${o.channel}`:`PWM${o.channel}`,o.pin,o.timer,o.connector||((board==='mini-v2'||board==='mini-v2-vib')?`J10/${15-o.channel}`:'Номер сигнального выхода по маркировке платы')])));
      if(p.iomcu_outputs)content.append(table(['Выход IOMCU','Вывод STM32F103','Таймер'],p.iomcu_outputs.map(o=>[o.channel,o.pin,o.timer])));
      paragraph('Группы аппаратных таймеров: '+Object.entries(groups).map(([g,v])=>`${g}: ${v.join(', ')}`).join('; ')+'. Частота и протокол внутри одной группы связаны; проверяйте настройки перед смешением серво и моторов.');
      content.append(node('h3','RCIN: подключение и настройка ArduPilot / INAV'));
      if(board==='pro') {
        paragraph('Pro: выделенный RCIN обслуживает STM32F103 IOMCU. В его HWDEF вход PPM — PA8 / TIM1 CH1. Не используйте распиновку Mini. Для последовательных приёмников на UART H743 применяется SERIALn_PROTOCOL=23. INAV для Pro в этом каталоге не поддерживается.');
      } else {
        paragraph(board==='mini'?'Выделенный RCIN старой Mini: PA3 / TIM2_CH4. Это отдельный вход приёмника, не UART RX.':'Выделенный RCIN Mini v2 / Vib: J10/1, PB3 / TIM2_CH2. Это отдельный вход приёмника, не UART RX.');
        paragraph('Подключение: сигнальный выход приёмника к RCIN, общий GND. Используйте логические уровни 3,3 В. Питание приёмника подключайте отдельно по его паспорту; не подавайте 5 В на сигнальный контакт. TXS0108 не делает вход универсальным для любых уровней и длинных проводов.');
        content.append(node('h4','ArduPilot — выделенный RCIN'));
        paragraph('Для PPM или стандартного инвертированного SBUS подключите выход приёмника к RCIN. RC_PROTOCOLS=1 разрешает автоматическое распознавание; для проверки только SBUS можно задать RC_PROTOCOLS=8. SERIALn_PROTOCOL для самого выделенного RCIN настраивать не требуется. Перезагрузите и проверьте каналы в Mission Planner → Radio Calibration, затем откалибруйте диапазоны. Проверку потери сигнала выполняйте с отключёнными опасными нагрузками. Отсутствие приёмника не означает неисправность RCIN.');
        content.append(node('h4','ArduPilot — CRSF / ELRS через UART'));
        paragraph((board==='mini'?'USART2 соответствует SERIAL2':'USART2 соответствует SERIAL1')+': PD5 TX контроллера → RX приёмника, PD6 RX → TX приёмника, общий GND. Установите SERIALn_PROTOCOL=23 для выбранного UART (n — указанный номер SERIAL). CRSF подключается к UART, не к выделенному контакту RCIN. Не подключайте одновременно несколько источников управления при первичной настройке.');
        content.append(node('h4','INAV — SBUS на выделенном RCIN'));
        paragraph('Поддерживается SBUS 100 кбит/с, 8E2. PPM на выделенном RCIN в этой сборке INAV не поддерживается. В Receiver выберите Serial/SBUS, затем выполните в CLI:');
        content.append(node('pre','set serialrx_provider = SBUS\nset mybox_sbus_rcin = ON\nset serialrx_inverted = OFF\nsave'));
        paragraph('После перезапуска проверьте движение каналов, середины, крайние значения и failsafe при выключении передатчика. OFF для serialrx_inverted здесь соответствует штатному инвертированному SBUS в реализации выделенного входа, как указано в документации этой сборки.');
        content.append(node('h4','INAV — CRSF / ELRS через UART'));
        paragraph('Используйте UART2 (USART2): PD5 TX → RX приёмника, PD6 RX → TX приёмника, GND. В Ports включите Serial RX только у этого UART; в Receiver выберите CRSF. Выделенный вход отключите:');
        content.append(node('pre','set mybox_sbus_rcin = OFF\nset serialrx_provider = CRSF\nsave'));
      }
      content.append(node('h3','UART, USB, CAN, I²C и остальные выводы'));
      paragraph('UART: TX контроллера подключается к RX устройства, RX — к TX, общий GND. Логические уровни 3,3 В; V_PWM — отдельное внешнее питание серв. CAN требует правильной терминальной нагрузки и общего опорного потенциала. SWD: PA13 SWDIO, PA14 SWCLK.');
      const allPins=node('details');allPins.append(node('summary','Все выводы MCU и назначения шин'),table(['Вывод MCU','Назначение','Параметры HWDEF'],p.pins.map(v=>[v.pin,v.signal,v.config])));content.append(allPins);
      if(board!=='pro'){
        paragraph(board==='mini'?'SERIAL0 USB; SERIAL1 UART7 PE8 TX / PE7 RX (+ RTS PE9 / CTS PE10); SERIAL2 USART2 PD5 TX / PD6 RX (+ RTS PD4 / CTS PD3); SERIAL3 UART4 PB9 TX / PB8 RX; SERIAL4 UART8 PE1 TX / PE0 RX; SERIAL5 USART1 PA9 TX / PA10 RX. RCIN PA3 / TIM2_CH4.':'SERIAL0 USB J6; SERIAL1 USART2 J13 PD5 TX / PD6 RX (+ RTS PD4 / CTS PD3); SERIAL2 UART7 J7 PE8 TX / PE7 RX (+ RTS PE9 / CTS PE10); SERIAL3 USART1 J4 PA9 TX / PA10 RX; SERIAL4 UART8 J11 PE1 TX / PE0 RX; SERIAL5 USART3 J14 PD8 TX / PD9 RX. RCIN J10/1 PB3 / TIM2_CH2.');
        paragraph('АЦП: PC0 напряжение, PC1 ток, PC4 аналоговое давление, PC5 RSSI. Коэффициенты напряжения '+p.voltage_scale+', тока '+p.current_scale+' А/В, давления 2. Коэффициенты из профиля требуют сверки с реальным модулем питания. Встроенного компаса нет; внешние датчики подключаются к соответствующей I²C-шине.');
        paragraph('IMU: '+p.imus.map(i=>`${i.model}, ${i.spi}, CS ${i.cs}`).join('; ')+'. Барометры: '+p.barometers.map(b=>`${b.model}, ${b.bus}, 0x${b.address.toString(16)}`).join('; ')+'.');
      }
      paragraph('Эта справка описывает назначения выводов и заявленные программные возможности. Полный электрический тракт, монтаж и совместимость внешних нагрузок проверяются измерениями.');
      const links=node('p');for(const [label,url] of [['HWDEF ArduPilot',p.ardupilot_source],['Поддержка INAV и DShot',p.inav_source ? 'https://github.com/Artem2817/MYBOXES_INAV/blob/inav-'+selection.line+'/README.ru.md' : null]]){if(!url)continue;const a=node('a',label);a.href=url;a.target='_blank';a.rel='noreferrer';links.append(a,document.createTextNode(' · '));}content.append(links);
    }catch(error){if(current===generation){content.replaceChildren(node('p',error.message));}}
  }
  selector.addEventListener('change',()=>load(selector.value));
  document.addEventListener('mybox:selection',event=>{
    selection=event.detail;
    const key=JSON.stringify([selection.board,selection.firmware,selection.line,selection.capabilities]);
    if(key===selectionKey)return;
    selectionKey=key;load(selection.board);
  });
  const initial=new URLSearchParams(location.search).get('board');load(valid.has(initial)?initial:'mini-v2');
})();
