/* Short, reviewed highlights for historical releases; new releases use their own notes. */
const releaseNotes = (() => {
  const inav9 = {
    1: "Первая адаптация INAV 9.1 для Mini: основные датчики, PWM, USB и прошивка через DFU.",
    2: "Расширена поддержка датчиков семейства Mini. Для Vib добавлены ICM-42670-P и второй SPA06-003.",
    3: "Добавлен SBUS на выделенном RCIN. На Vib приоритет получили выносные IMU и барометр.",
    4: "Уточнена шина MS4525 на Mini v1: внешняя I²C2. Сохранён SBUS на RCIN.",
    5: "MS4525 ищется на доступных I²C-шинах, начиная с внешней I²C2.",
    6: "Доработано чтение FAT16/FAT32: карты с таблицей разделов MBR и без неё.",
    7: "Доработаны запуск SDMMC, подтяжки и попытка запуска SD-карты в режиме 1 бит.",
    10: "Добавлен DShot для совместимых моторных выходов. Продолжена доработка запуска SD-карт.",
    11: "Доработан запуск SD-карт и расширен вывод диагностики sd_info.",
    14: "Включена телеметрия ESC через отдельный UART: обороты мотора для OSD и Blackbox."
  };
  function plain(text) {
    return String(text || "").replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/https?:\/\/\S+/g, " ").replace(/<[^>]*>/g, " ")
      .replace(/[`*_>#]/g, "").replace(/\s+/g, " ").trim();
  }
  function short(text) {
    text = plain(text);
    return text.length > 240 ? text.slice(0, 237).replace(/\s+\S*$/, "") + "…" : text;
  }
  function summary(release) {
    const firmware = release.firmware || "ardupilot";
    const rev = Number(release.revision);
    if (firmware === "inav" && release.version === "9.1.0") {
      if (rev === 15) {
        if (release.channel === "stable") return "Проверенная r15 переведена в Stable без пересборки: HEX совпадает с r15-dev.";
        return release.board === "mini"
          ? "Исправлен поворот IMU Mini v1: 180° по крену. Сохранены DShot и телеметрия ESC."
          : "Сохранена поддержка датчиков, SD-карты, DShot и телеметрии ESC из r14.";
      }
      if (inav9[rev]) return inav9[rev];
    }
    if (firmware === "inav" && release.version === "10.0.0") {
      if (rev === 16) return "Переход на INAV 10. Добавлены GPS и компас DroneCAN, выбор CAN1/CAN2 и профиль Matek M10Q-3100.";
      if (rev === 17) return "Ограничены ожидания SPI, SD, I²C и OSD; проверяются данные CAN-GPS. Штатная полётная логика сохранена.";
    }
    if (firmware === "ardupilot" && release.version === "4.7.1") {
      if (rev === 2 && ["mini-v2", "mini-v2-vib"].includes(release.board))
        return release.board === "mini-v2-vib"
          ? "Уточнена компенсация SPA06-003. Приоритет у виброизолированных IMU и барометра; подогрев по умолчанию выключен."
          : "Уточнена компенсация барометра SPA06-003. Сохранены ICM-45686, 13 PWM и выключенный по умолчанию подогрев.";
      if (rev === 1 && release.board === "mini-v2-vib")
        return "Первая сборка для Mini v2 Vib: две IMU, два барометра, 13 PWM, OSD и поддержка подогрева.";
      if (rev === 1 && release.board === "mini-v2")
        return "Первая сборка для Mini v2: ICM-45686, SPA06-003, 13 PWM, OSD и поддержка подогрева.";
      if (rev === 1) return "Первый выпуск для этой платы. Доступны прошивки Copter, Plane и Rover.";
    }
    const notes = String(release.notes || "");
    const explicit = /<!--\s*MYBOX_CHANGES\s*-->([\s\S]*?)<!--\s*\/MYBOX_CHANGES\s*-->/.exec(notes);
    if (explicit) return short(explicit[1]);
    const lines = notes.split(/\n+/).map(s => s.trim())
      .filter(s => s && !/^#|^https?:|^\*\*Full Changelog|^\[.*\]\(/i.test(s));
    const bullets = lines.filter(s => /^[-*]\s/.test(s));
    const selected = (bullets.length ? bullets : lines).slice(0, 2).join(" ");
    return short(selected) || "Краткое описание изменений не указано автором. Подробности доступны в описании выпуска.";
  }
  return { summary };
})();
if (typeof module !== "undefined") module.exports = releaseNotes;
