const query = new URLSearchParams(location.search);
const allowed = {
  firmware: new Set(["ardupilot", "inav"]),
  board: new Set(["mini-v2", "mini-v2-vib", "mini", "pro"]),
  vehicle: new Set(["copter", "plane", "rover"]),
  channel: new Set(["all", "stable", "beta", "dev"]),
};
const queryValue = (name, fallback) => allowed[name].has(query.get(name)) ? query.get(name) : fallback;

const initialFirmware = queryValue("firmware", "ardupilot");
const initialBoard = queryValue("board", "mini-v2");
const firmwareNames = { ardupilot: "ArduPilot", inav: "INAV" };

const state = {
  firmware: initialFirmware,
  board: initialFirmware === "inav" && initialBoard === "pro" ? "mini-v2" : initialBoard,
  vehicle: queryValue("vehicle", "copter"),
  channel: queryValue("channel", "all"),
  version: "latest",
  catalog: null,
};

const elements = {
  boardButtons: [...document.querySelectorAll(".board-button")],
  firmware: document.querySelector("#firmware-select"),
  firmwareName: document.querySelector("#firmware-name"),
  footerFirmware: document.querySelector("#footer-firmware"),
  ardupilotGuide: document.querySelector("#ardupilot-guide"),
  inavGuide: document.querySelector("#inav-guide"),
  vibDescription: document.querySelector("#vib-description"),
  vehicleFilter: document.querySelector("#vehicle-filter"),
  vehicle: document.querySelector("#vehicle-select"),
  channel: document.querySelector("#channel-select"),
  version: document.querySelector("#version-select"),
  list: document.querySelector("#release-list"),
  loading: document.querySelector("#loading"),
  error: document.querySelector("#error"),
  results: document.querySelector(".results"),
  count: document.querySelector("#release-count"),
  time: document.querySelector("#catalog-time"),
  repo: document.querySelector("#repo-link"),
  privateNote: document.querySelector("#private-note"),
  template: document.querySelector("#release-template"),
};

const formatNames = {
  apj: ["APJ", "Обновление через GCS"],
  bin: ["BIN", "Чистый бинарник"],
  hex: ["HEX + bootloader", "Первая прошивка"],
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["Б", "КБ", "МБ", "ГБ"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function formatDate(value) {
  if (!value) return "Дата неизвестна";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function updateUrl() {
  const params = new URLSearchParams({ firmware: state.firmware, board: state.board, channel: state.channel });
  if (state.firmware === "ardupilot") params.set("vehicle", state.vehicle);
  history.replaceState(null, "", `?${params}`);
}

function releaseLabel(release) {
  return `${release.version}-r${release.revision} · ${release.channel.toUpperCase()}`;
}

function matchesSelection(release) {
  return (release.firmware || "ardupilot") === state.firmware
    && release.board === state.board
    && (state.channel === "all" || release.channel === state.channel);
}

function matchingReleases() {
  return state.catalog.releases.filter((release) =>
    matchesSelection(release) && (state.version === "latest" || release.tag === state.version)
  );
}

function refreshVersionOptions() {
  const previous = state.version;
  const candidates = state.catalog.releases.filter(matchesSelection);
  elements.version.replaceChildren(new Option("Последняя подходящая", "latest"));
  for (const release of candidates) {
    elements.version.add(new Option(releaseLabel(release), release.tag));
  }
  state.version = candidates.some((release) => release.tag === previous) ? previous : "latest";
  elements.version.value = state.version;
}

function assetLink(asset, compact = false) {
  const link = document.createElement("a");
  link.href = asset.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  if (compact) {
    link.textContent = `${asset.format.toUpperCase()} · ${formatBytes(asset.size)}`;
    return link;
  }

  const inavHex = asset.component === "firmware";
  link.className = inavHex || asset.format === "apj" ? "download-button recommended" : "download-button";
  const text = inavHex
    ? ["HEX для INAV Configurator", "Локальная прошивка через DFU"]
    : formatNames[asset.format] || [asset.format.toUpperCase(), "Скачать файл"];
  const copy = document.createElement("span");
  const title = document.createElement("strong");
  const detail = document.createElement("small");
  const arrow = document.createElement("span");
  title.textContent = text[0];
  detail.textContent = `${text[1]} · ${formatBytes(asset.size)}`;
  arrow.className = "download-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↓";
  copy.append(title, detail);
  link.append(copy, arrow);
  return link;
}

function componentCard(title, description, assets) {
  const card = document.createElement("section");
  card.className = "component-card";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const copy = document.createElement("p");
  copy.textContent = description;
  const links = document.createElement("div");
  links.className = "component-links";
  for (const asset of assets) links.append(assetLink(asset, true));
  if (!assets.length) links.innerHTML = '<span class="missing">Нет файлов</span>';
  card.append(heading, copy, links);
  return card;
}

function renderRelease(release) {
  const inav = release.firmware === "inav";
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".release-card");
  const badge = card.querySelector(".channel-badge");
  badge.textContent = release.channel;
  badge.classList.add(release.channel);
  card.querySelector(".release-date").textContent = formatDate(release.published_at);
  card.querySelector(".release-title").textContent = `${release.board_name} · ${release.version}-r${release.revision}`;
  card.querySelector(".release-tag").textContent = release.tag;
  const releaseLink = card.querySelector(".release-link");
  releaseLink.href = release.release_url;

  const vehicleSection = card.querySelector(".vehicle-downloads");
  const vehicleAssets = release.assets.filter((asset) =>
    inav ? asset.component === "firmware" : asset.component === "vehicle" && asset.vehicle === state.vehicle
  );
  const heading = document.createElement("div");
  heading.className = "download-heading";
  const headingTitle = document.createElement("h3");
  const headingCopy = document.createElement("span");
  headingTitle.textContent = inav ? "INAV" : state.vehicle[0].toUpperCase() + state.vehicle.slice(1);
  headingCopy.textContent = release.bench_only ? "Стендовая сборка · PWM" : "Прошивка основного STM32H743";
  heading.append(headingTitle, headingCopy);
  const buttons = document.createElement("div");
  buttons.className = "download-buttons";
  const ordered = [...vehicleAssets].sort((a, b) => ["apj", "bin", "hex"].indexOf(a.format) - ["apj", "bin", "hex"].indexOf(b.format));
  for (const asset of ordered) buttons.append(assetLink(asset));
  if (!ordered.length) buttons.innerHTML = '<div class="missing">Для этого типа аппарата файлов нет.</div>';
  vehicleSection.append(heading, buttons);

  const componentGrid = card.querySelector(".component-grid");
  if (inav) {
    const metadata = release.assets.filter((asset) => asset.component === "metadata");
    const details = release.board === "mini-v2-vib"
      ? "SHA-256 и манифест. Используется основной ICM-45686. Датчики выносного модуля отключены."
      : "Манифест сборки и контрольная сумма SHA-256.";
    componentGrid.append(componentCard("Проверка файлов", details, metadata));
    return fragment;
  }
  const bootloader = release.assets.filter((asset) => asset.component === "bootloader");
  componentGrid.append(componentCard("Загрузчик H743", "Отдельный bootloader для восстановления или производственной прошивки.", bootloader));
  if (release.board === "pro") {
    const iomcu = release.assets.filter((asset) => asset.component === "iomcu");
    componentGrid.append(componentCard("IOMCU STM32F103", "IO firmware, собранная из того же коммита, что и основной образ Pro.", iomcu));
  } else {
    const metadata = release.assets.filter((asset) => asset.component === "metadata");
    componentGrid.append(componentCard("Проверка файлов", "Манифест сборки и контрольные суммы SHA-256.", metadata));
  }
  return fragment;
}

function render() {
  updateUrl();
  if (!state.catalog) return;
  refreshVersionOptions();
  elements.count.textContent = state.catalog.releases.filter(
    (release) => (release.firmware || "ardupilot") === state.firmware
  ).length;
  elements.repo.href = state.catalog.repositories?.[state.firmware] || state.catalog.repository_url;
  elements.list.replaceChildren();
  const releases = matchingReleases();
  const visible = state.version === "latest" ? releases.slice(0, 1) : releases;
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "status-card";
    empty.innerHTML = "<div><strong>Подходящих релизов пока нет</strong><span>Выберите другой канал или плату.</span></div>";
    elements.list.append(empty);
  } else {
    for (const release of visible) elements.list.append(renderRelease(release));
  }
  elements.results.setAttribute("aria-busy", "false");
}

function applyStateToControls() {
  const inav = state.firmware === "inav";
  elements.boardButtons.forEach((button) => {
    const selected = button.dataset.board === state.board;
    button.hidden = inav && button.dataset.board === "pro";
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  elements.firmware.value = state.firmware;
  elements.firmwareName.textContent = firmwareNames[state.firmware].toUpperCase();
  elements.footerFirmware.textContent = "MYBOXES / " + elements.firmwareName.textContent;
  elements.vehicleFilter.hidden = inav;
  elements.ardupilotGuide.hidden = inav;
  elements.inavGuide.hidden = !inav;
  elements.vibDescription.textContent = inav ? "С виброизоляцией · основной IMU" : "С виброизоляцией · два IMU";
  elements.vehicle.value = state.vehicle;
  elements.channel.value = state.channel;
}

async function initialize() {
  applyStateToControls();
  try {
    const response = await fetch("firmware-index.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.catalog = await response.json();
    elements.loading.hidden = true;
    elements.time.textContent = `Каталог обновлён ${formatDate(state.catalog.generated_at)}`;
    elements.privateNote.hidden = !state.catalog.requires_github_access;
    render();
  } catch (error) {
    elements.loading.hidden = true;
    elements.error.hidden = false;
    const box = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    title.textContent = "Каталог не загрузился";
    detail.textContent = `${error.message}. Попробуйте обновить страницу.`;
    box.append(title, detail);
    elements.error.replaceChildren(box);
    elements.results.setAttribute("aria-busy", "false");
  }
}

elements.boardButtons.forEach((button) => button.addEventListener("click", () => {
  state.board = button.dataset.board;
  state.version = "latest";
  applyStateToControls();
  render();
}));
elements.firmware.addEventListener("change", () => {
  state.firmware = elements.firmware.value;
  if (state.firmware === "inav" && state.board === "pro") state.board = "mini-v2";
  state.version = "latest";
  state.channel = "all";
  applyStateToControls();
  render();
});
elements.vehicle.addEventListener("change", () => { state.vehicle = elements.vehicle.value; render(); });
elements.channel.addEventListener("change", () => { state.channel = elements.channel.value; state.version = "latest"; render(); });
elements.version.addEventListener("change", () => { state.version = elements.version.value; render(); });

initialize();
