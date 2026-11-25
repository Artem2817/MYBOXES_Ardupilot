/* Expandable setup chapters. New modules opt in with data-guide-module. */
(() => {
  const nav = document.querySelector("#chapter-navigation");
  const menu = document.querySelector(".chapter-menu");
  if (!nav || !menu) return;
  const modules = [...document.querySelectorAll("[data-guide-module]")];
  const reference = document.querySelector("#reference-content");
  const mobile = matchMedia("(max-width: 980px)");
  const link = (id, title, nested = false) => {
    const a = document.createElement("a");
    a.href = "#" + id;
    a.textContent = title;
    a.className = nested ? "chapter-link chapter-sub-link" : "chapter-link";
    return a;
  };
  let pendingAnchor = location.hash;
  function rebuild() {
    nav.replaceChildren(link("firmware-selector", "Выбрать прошивку"), link("firmware-downloads", "Скачать файл"));
    for (const module of modules) {
      if (module.hidden) continue;
      const group = document.createElement("div");
      group.className = "chapter-nav-group";
      group.append(link(module.id, module.dataset.guideTitle));
      for (const chapter of module.querySelectorAll("[data-guide-chapter]")) {
        const summary = chapter.querySelector(":scope > summary");
        if (summary) group.append(link(chapter.id, chapter.dataset.guideNavTitle || summary.textContent.trim(), true));
      }
      nav.append(group);
    }
    updateCurrent();
    if (pendingAnchor) {
      try {
        if (showTarget(decodeURIComponent(pendingAnchor.slice(1)), false)) pendingAnchor = "";
      } catch (_) { pendingAnchor = ""; }
    }
  }
  function wrapHardware() {
    if (!reference) return;
    const children = [...reference.children];
    if (!children.some(node => node.tagName === "H3")) return;
    let group = null, body = null;
    const fragment = document.createDocumentFragment();
    for (const child of children) {
      if (child.tagName === "H3") {
        group = document.createElement("details");
        const title = child.textContent;
        const chapter = title.startsWith("PWM") ? ["board-pwm", "Моторы, сервы и DShot"] :
          /при[её]мник|RCIN|SBUS/i.test(title) ? ["board-receiver", "Подключить приёмник"] :
          title.includes("UART, USB") ? ["board-buses", "Для опытных: все выводы и шины"] : null;
        group.className = chapter ? "guide-chapter" : "guide-chapter advanced-note";
        group.id = chapter ? chapter[0] : "board-about";
        if (chapter) group.dataset.guideChapter = "";
        const summary = document.createElement("summary");
        summary.textContent = chapter ? chapter[1] : "Для опытных: данные платы";
        body = document.createElement("div");
        body.className = "chapter-content";
        group.append(summary, body);
        fragment.append(group);
      } else if (body) {
        body.append(child);
      } else {
        fragment.append(child);
      }
    }
    reference.replaceChildren(fragment);
    const receiver = reference.querySelector("#board-receiver .chapter-content");
    if (receiver) {
      const receiverNodes = [...receiver.children];
      const receiverFragment = document.createDocumentFragment();
      let optionBody = null;
      for (const child of receiverNodes) {
        if (child.tagName === "H4") {
          const option = document.createElement("details");
          option.className = "receiver-option advanced-note";
          option.dataset.receiverFirmware = child.textContent.startsWith("INAV") ? "inav" : "ardupilot";
          const summary = document.createElement("summary");
          summary.textContent = child.textContent;
          optionBody = document.createElement("div");
          option.append(summary, optionBody);
          receiverFragment.append(option);
        } else if (optionBody) optionBody.append(child);
        else receiverFragment.append(child);
      }
      receiver.replaceChildren(receiverFragment);
      filterReceivers();
    }
    // MCU/timer tables remain available, but do not dominate the basic output setup.
    const pwm = reference.querySelector("#board-pwm .chapter-content");
    if (pwm) for (const table of [...pwm.querySelectorAll("table")]) {
      const holder = table.parentElement !== pwm && table.parentElement.children.length === 1 ? table.parentElement : table;
      const advanced = document.createElement("details");
      advanced.className = "advanced-note";
      const summary = document.createElement("summary");
      summary.textContent = "Таблица выходов и аппаратных таймеров";
      holder.replaceWith(advanced);
      advanced.append(summary, holder);
    }
  }
  function filterReceivers() {
    const firmware = document.querySelector("#firmware-select")?.value;
    document.querySelectorAll("[data-receiver-firmware]").forEach(option => {
      option.hidden = option.dataset.receiverFirmware !== firmware;
    });
  }
  document.querySelector("#firmware-select")?.addEventListener("change", filterReceivers);
  function showTarget(id, changeUrl = true) {
    const target = document.getElementById(id);
    if (!target || target.closest("[hidden]")) return false;
    for (let parent = target; parent; parent = parent.parentElement) {
      if (parent.tagName === "DETAILS") parent.open = true;
    }
    if (changeUrl) {
      pendingAnchor = "";
      const url = new URL(location.href);
      url.hash = id;
      history.replaceState(null, "", url);
    }
    if (mobile.matches) menu.open = false;
    requestAnimationFrame(() => {
      target.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"});
      const focus = target.tagName === "DETAILS" ? target.querySelector(":scope > summary") : target;
      if (!focus.hasAttribute("tabindex")) focus.setAttribute("tabindex", "-1");
      focus.focus({preventScroll: true});
      updateCurrent();
    });
    return true;
  }
  function updateCurrent() {
    const links = [...nav.querySelectorAll("a[href^='#']")];
    let active = links[0];
    for (const a of links) {
      const target = document.getElementById(a.hash.slice(1));
      if (!target || target.closest("[hidden]")) continue;
      let hidden = false;
      for (let p = target.parentElement; p; p = p.parentElement) {
        if (p.tagName === "DETAILS" && !p.open) { hidden = true; break; }
      }
      const box = target.getBoundingClientRect();
      if (!hidden && box.height && box.top <= 180) active = a;
    }
    for (const a of links) {
      a.classList.toggle("active", a === active);
      if (a === active) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    }
  }
  document.addEventListener("click", event => {
    const anchor = event.target.closest("a[href^='#']");
    if (!anchor || !anchor.hash) return;
    let id;
    try { id = decodeURIComponent(anchor.hash.slice(1)); } catch (_) { return; }
    if (showTarget(id)) event.preventDefault();
  });
  let frame = 0;
  addEventListener("scroll", () => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; updateCurrent(); });
  }, {passive:true});
  document.addEventListener("toggle", updateCurrent, true);
  const resize = () => { menu.open = !mobile.matches; updateCurrent(); };
  mobile.addEventListener("change", resize);
  resize();
  wrapHardware();
  rebuild();
  if (reference) new MutationObserver(() => {
    wrapHardware();
    rebuild();
  }).observe(reference, {childList:true});
  for (const module of modules) new MutationObserver(rebuild).observe(module, {attributes:true, attributeFilter:["hidden"]});
  if (location.hash) {
    try { showTarget(decodeURIComponent(location.hash.slice(1)), false); } catch (_) { /* Ignore malformed anchors. */ }
  }
})();
