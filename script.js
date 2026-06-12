const form = document.querySelector("#load-form");
const searchForm = document.querySelector("#search-form");
const playerSearchForm = document.querySelector("#player-search-form");
const heroSection = document.querySelector("#hero-section");
const controlsPanel = document.querySelector("#controls-panel");
const urlInput = document.querySelector("#url-input");
const searchDateFromInput = document.querySelector("#search-date-from");
const searchDateToInput = document.querySelector("#search-date-to");
const playerFirstNameInput = document.querySelector("#player-first-name");
const playerLastNameInput = document.querySelector("#player-last-name");
const playerCountryInput = document.querySelector("#player-country");
const htmlInput = document.querySelector("#html-input");
const languageOptions = document.querySelectorAll("[data-language-option]");
const parseButton = document.querySelector("#parse-button");
const demoButton = document.querySelector("#demo-button");
const statusNode = document.querySelector("#status");
const resultPanel = document.querySelector("#result-panel");
const resultKindNode = document.querySelector("#result-kind");
const resultTitleNode = document.querySelector("#result-title");
const backLinkNode = document.querySelector("#back-link");
const bookmarkButtonNode = document.querySelector("#bookmark-button");
const watchButtonNode = document.querySelector("#watch-button");
const fideLinkNode = document.querySelector("#fide-link");
const originalLinkNode = document.querySelector("#original-link");
const resultSubtitleNode = document.querySelector("#result-subtitle");
const resultMetaNode = document.querySelector("#result-meta");
const resultMetaLinksNode = document.querySelector("#result-meta-links");
const typeFilterWrapNode = document.querySelector("#type-filter-wrap");
const typeFilterSelectNode = document.querySelector("#type-filter-select");
const resultsHeadNode = document.querySelector("#results-head");
const resultsBodyNode = document.querySelector("#results-body");
const mobileListNode = document.querySelector("#mobile-list");
const mobileReloadButton = document.querySelector("#mobile-reload");
const clearButton = document.querySelector("#clear-button");
const DEFAULT_DOCUMENT_TITLE = document.title;

const {
  DEMO_HTML,
  DEMO_URL,
  PROXY_LOADER,
  attachPlayerNavigation,
  buildInternalPageUrl,
  buildPlayerSearchPayload,
  buildTournamentSearchPayload,
  chip,
  collectUniqueColumnValues,
  debugLog,
  escapeHtml,
  filterRowsByColumnValue,
  findColumnIndex,
  isTournamentUrl,
  normalizeFideId,
  normalizeSupportedUrl,
  parseChessResultsPage,
  parsePlayerSearchPage,
  parseTournamentSearchPage,
  prependBookmarkMarker,
  readQueryState,
  renderMobileRows,
  renderTableHead,
  renderTableRows,
  writeQueryState
} = window.ChessResults;

const BOOKMARK_STORAGE_KEY = "easy-chess-results:bookmarked-players";
const WATCH_STORAGE_KEY = "easy-chess-results:watched-players";
const LANGUAGE_STORAGE_KEY = "easy-chess-results:language";
const WATCH_INTERVAL_MS = 60000;
const TRANSLATIONS = {
  en: {
    "hero.eyebrow": "Chess-Results parser",
    "hero.title": "Minimal tournament and player views",
    "hero.lede": "Paste a Chess-Results tournament ranking or player page URL and render a cleaner view.",

    "form.urlLabel": "Chess-Results URL",
    "form.loadPage": "Load page",
    "form.loadDemo": "Load demo player",
    "search.tournamentNote": "Or search tournaments directly on Chess-Results.",
    "search.endFrom": "End date from",
    "search.endTo": "End date to",
    "search.tournamentsButton": "Search tournaments",
    "search.playerNote": "Or search players by first and last name. Country defaults to LAT.",
    "search.firstName": "First name",
    "search.lastName": "Last name",
    "search.country": "Country",
    "search.playersButton": "Search players",
    "fallback.summary": "Fallback if browser blocks direct loading",
    "fallback.help": "Some browsers will block cross-origin requests to Chess-Results. If that happens, open the page, view page source, copy the HTML, and paste it here.",
    "fallback.htmlSource": "HTML source",
    "fallback.parse": "Parse pasted HTML",
    "result.back": "Back to tournament",
    "result.type": "Typ",
    "result.reload": "Reload",
    "result.view": "View",
    "bookmark.add": "Bookmark",
    "bookmark.added": "Bookmarked",
    "watch.add": "Watch player",
    "watch.on": "Watching",
    "filter.allGroups": "All groups",
    "status.removedBookmark": "Removed bookmark for {player}.",
    "status.bookmarked": "Bookmarked {player}.",
    "status.watchStarted": "Watching {player}. This page will check for changes every minute while open.",
    "status.watchStopped": "Stopped watching {player}.",
    "status.notificationsOn": "Browser notifications enabled.",
    "status.playerChanged": "New Chess-Results data for {player}.",
    "status.loading": "Loading Chess-Results page via {proxy}...",
    "status.loadingNormalized": "Loading supported Chess-Results view via {proxy}...",
    "status.loaded": "Loaded {rows} rows via {proxy}.",
    "status.loadedNormalized": "Loaded {rows} rows. Converted unsupported art=0 link to ranking view (art=1).",
    "status.enterUrl": "Enter a Chess-Results page URL.",
    "status.proxyFallback": "{message} If this is a browser CORS block, use the HTML paste fallback below.",
    "status.pasteHtml": "Paste the full Chess-Results page HTML first.",
    "status.parsed": "Parsed {rows} rows from pasted HTML.",
    "status.demoLoaded": "Loaded demo data for {player}.",
    "status.searchPreparing": "Preparing tournament search via {proxy}...",
    "status.searchingTournaments": "Searching tournaments via {proxy}...",
    "status.tournamentsFound": "Found {rows} tournaments.",
    "status.playerSearchPreparing": "Preparing player search via {proxy}...",
    "status.searchingPlayers": "Searching players via {proxy}...",
    "status.playersFound": "Found {rows} player entries.",
    "label.country": "Country",
    "label.endFrom": "End from",
    "label.endTo": "End to",
    "label.firstName": "First name",
    "label.lastName": "Last name"
  },
  ru: {
    "hero.eyebrow": "Парсер Chess-Results",
    "hero.title": "Удобные турниры и игроки",
    "hero.lede": "Вставь ссылку на таблицу турнира или страницу игрока Chess-Results — покажем чистый вид.",

    "form.urlLabel": "Ссылка Chess-Results",
    "form.loadPage": "Загрузить",
    "form.loadDemo": "Демо игрок",
    "search.tournamentNote": "Или ищи турниры прямо на Chess-Results.",
    "search.endFrom": "Дата окончания от",
    "search.endTo": "Дата окончания до",
    "search.tournamentsButton": "Искать турниры",
    "search.playerNote": "Или ищи игроков по имени и фамилии. Страна по умолчанию LAT.",
    "search.firstName": "Имя",
    "search.lastName": "Фамилия",
    "search.country": "Страна",
    "search.playersButton": "Искать игроков",
    "fallback.summary": "Запасной вариант, если браузер блокирует загрузку",
    "fallback.help": "Если браузер заблокирует запросы к Chess-Results, открой страницу, скопируй HTML-исходник и вставь сюда.",
    "fallback.htmlSource": "HTML-исходник",
    "fallback.parse": "Разобрать HTML",
    "result.back": "Назад к турниру",
    "result.type": "Тип",
    "result.reload": "Обновить",
    "result.view": "Вид",
    "bookmark.add": "В закладки",
    "bookmark.added": "В закладках",
    "watch.add": "Следить за игроком",
    "watch.on": "Следим",
    "filter.allGroups": "Все группы",
    "status.removedBookmark": "Убрали закладку для {player}.",
    "status.bookmarked": "Добавили {player} в закладки.",
    "status.watchStarted": "Следим за {player}. Пока страница открыта, проверяем изменения раз в минуту.",
    "status.watchStopped": "Больше не следим за {player}.",
    "status.notificationsOn": "Уведомления браузера включены.",
    "status.playerChanged": "На Chess-Results появились изменения для {player}.",
    "status.loading": "Загружаем страницу Chess-Results через {proxy}...",
    "status.loadingNormalized": "Загружаем поддерживаемый вид Chess-Results через {proxy}...",
    "status.loaded": "Загружено строк: {rows} через {proxy}.",
    "status.loadedNormalized": "Загружено строк: {rows}. Неподдерживаемая ссылка art=0 преобразована в таблицу art=1.",
    "status.enterUrl": "Вставь ссылку на страницу Chess-Results.",
    "status.proxyFallback": "{message} Если это CORS-блокировка браузера, используй вставку HTML ниже.",
    "status.pasteHtml": "Сначала вставь полный HTML страницы Chess-Results.",
    "status.parsed": "Разобрано строк из HTML: {rows}.",
    "status.demoLoaded": "Загружены демо-данные для {player}.",
    "status.searchPreparing": "Готовим поиск турниров через {proxy}...",
    "status.searchingTournaments": "Ищем турниры через {proxy}...",
    "status.tournamentsFound": "Найдено турниров: {rows}.",
    "status.playerSearchPreparing": "Готовим поиск игроков через {proxy}...",
    "status.searchingPlayers": "Ищем игроков через {proxy}...",
    "status.playersFound": "Найдено записей игроков: {rows}.",
    "label.country": "Страна",
    "label.endFrom": "Окончание от",
    "label.endTo": "Окончание до",
    "label.firstName": "Имя",
    "label.lastName": "Фамилия"
  }
};
const TOURNAMENT_SEARCH_URL = "https://s2.chess-results.com/turniersuche.aspx?lan=1";
const TOURNAMENT_SEARCH_COUNTRY = "LAT";
const PLAYER_SEARCH_URL = "https://s2.chess-results.com/SpielerSuche.aspx?lan=1";
let currentView = null;
let currentTypeFilter = "";

let currentLanguage = readStoredLanguage();
let watchTimer = null;
let silentWatchReload = false;

function readStoredLanguage() {
  try {
    const stored = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "ru" || stored === "en" ? stored : "en";
  } catch {
    return "en";
  }
}

function t(key, params = {}) {
  const template = TRANSLATIONS[currentLanguage]?.[key] || TRANSLATIONS.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  languageOptions.forEach((option) => {
    const isActive = option.dataset.languageOption === currentLanguage;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  updateBookmarkButton(currentView);
  updateWatchButton(currentView);
  if (!currentView) {
    resultKindNode.textContent = t("result.view");
  } else {
    renderTypeFilter(currentView);
  }
}

function readJsonStorage(key, fallback = {}) {
  if (!window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(value));
}

function setStatus(message, tone = "") {
  debugLog("setStatus", { message, tone });
  statusNode.textContent = message;
  statusNode.className = `status ${tone}`.trim();
}

function updateOriginalLink(url = "") {
  originalLinkNode.href = url || "#";
  originalLinkNode.hidden = !url;
}

function updateFideLink(url = "") {
  fideLinkNode.href = url || "#";
  fideLinkNode.hidden = !url;
}

function updateDocumentTitle(view = null) {
  const viewTitle = String(view?.title || "").trim();
  document.title = viewTitle ? `${viewTitle} | ${DEFAULT_DOCUMENT_TITLE}` : DEFAULT_DOCUMENT_TITLE;
}

function readBookmarks() {
  return readJsonStorage(BOOKMARK_STORAGE_KEY, {});
}

function writeBookmarks(bookmarks) {
  writeJsonStorage(BOOKMARK_STORAGE_KEY, bookmarks);
}

function readWatchedPlayers() {
  return readJsonStorage(WATCH_STORAGE_KEY, {});
}

function writeWatchedPlayers(players) {
  writeJsonStorage(WATCH_STORAGE_KEY, players);
}

function normalizeBookmarkName(name = "") {
  return String(name || "").replace(/^(🔖|⭐)\s+/g, "").trim();
}

function updateBookmarkButton(view = null) {
  const playerName = normalizeBookmarkName(view?.title || "");
  if (view?.kind !== "player" || !playerName) {
    bookmarkButtonNode.hidden = true;
    bookmarkButtonNode.textContent = t("bookmark.add");
    bookmarkButtonNode.dataset.bookmarkKey = "";
    bookmarkButtonNode.dataset.playerName = "";
    bookmarkButtonNode.dataset.fideId = "";
    return;
  }

  const bookmarked = Boolean(readBookmarks()[playerName]);
  bookmarkButtonNode.hidden = false;
  bookmarkButtonNode.textContent = bookmarked ? t("bookmark.added") : t("bookmark.add");
  bookmarkButtonNode.dataset.bookmarkKey = playerName;
  bookmarkButtonNode.dataset.playerName = playerName;
  bookmarkButtonNode.dataset.fideId = normalizeFideId(view.fideId || "");
}

function decorateViewWithBookmarks(view) {
  if (!view || view.kind !== "tournament") {
    return view;
  }

  const bookmarks = readBookmarks();
  const bookmarkedNames = new Set(
    Object.entries(bookmarks)
      .flatMap(([key, entry]) => [normalizeBookmarkName(key), normalizeBookmarkName(entry?.name || "")])
      .filter(Boolean)
  );
  const nameColumnIndex = view.columns.findIndex((column) => column.label === "Name");

  if (!bookmarkedNames.size || nameColumnIndex === -1) {
    return view;
  }

  return {
    ...view,
    rows: view.rows.map((row) => {
      const updatedCells = row.cells.map((cell, index) => {
        if (index !== nameColumnIndex) {
          return cell;
        }

        const plainName = normalizeBookmarkName(cell.text);
        return bookmarkedNames.has(plainName) ? { ...cell, text: prependBookmarkMarker(cell.text, true) } : cell;
      });
      const plainMobileTitle = normalizeBookmarkName(row.mobile.title);
      return {
        ...row,
        cells: updatedCells,
        mobile: {
          ...row.mobile,
          title: bookmarkedNames.has(plainMobileTitle) ? prependBookmarkMarker(row.mobile.title, true) : row.mobile.title
        }
      };
    })
  };
}

function getPlayerWatchKey(view = null) {
  const sourceUrl = readQueryState(window.location.search).url;
  const fideId = normalizeFideId(view?.fideId || "");
  return fideId || normalizeSupportedUrl(sourceUrl) || normalizeBookmarkName(view?.title || "");
}

function buildPlayerSnapshot(view = null) {
  if (!view || view.kind !== "player") return "";
  return JSON.stringify({
    title: normalizeBookmarkName(view.title),
    chips: view.chips || [],
    rows: (view.rows || []).map((row) => ({
      cells: (row.cells || []).map((cell) => String(cell.text || "").trim())
    }))
  });
}

function updateWatchButton(view = null) {
  if (view?.kind !== "player") {
    watchButtonNode.hidden = true;
    watchButtonNode.textContent = t("watch.add");
    watchButtonNode.classList.remove("is-watching");
    watchButtonNode.dataset.watchKey = "";
    return;
  }

  const watchKey = getPlayerWatchKey(view);
  const watched = Boolean(readWatchedPlayers()[watchKey]);
  watchButtonNode.hidden = false;
  watchButtonNode.textContent = watched ? t("watch.on") : t("watch.add");
  watchButtonNode.classList.toggle("is-watching", watched);
  watchButtonNode.dataset.watchKey = watchKey;
}

function notifyPlayerChanged(playerName) {
  const message = t("status.playerChanged", { player: playerName || "player" });
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("Easy Chess Results", { body: message });
  }
  setStatus(message, "success");
}

function updateWatchedSnapshot(view = null, { notify = false } = {}) {
  if (view?.kind !== "player") return;
  const watchKey = getPlayerWatchKey(view);
  const watchedPlayers = readWatchedPlayers();
  const watched = watchedPlayers[watchKey];
  if (!watched) return;

  const snapshot = buildPlayerSnapshot(view);
  if (notify && watched.snapshot && watched.snapshot !== snapshot) {
    notifyPlayerChanged(normalizeBookmarkName(view.title));
  }
  watchedPlayers[watchKey] = {
    ...watched,
    name: normalizeBookmarkName(view.title),
    url: normalizeSupportedUrl(readQueryState(window.location.search).url),
    fideId: normalizeFideId(view.fideId || ""),
    snapshot,
    updatedAt: new Date().toISOString()
  };
  writeWatchedPlayers(watchedPlayers);
}

function scheduleWatchPolling() {
  if (watchTimer) clearInterval(watchTimer);
  watchTimer = setInterval(() => {
    const queryState = readQueryState(window.location.search);
    if (!currentView || currentView.kind !== "player" || !queryState.url) return;
    const watched = readWatchedPlayers()[getPlayerWatchKey(currentView)];
    if (!watched) return;
    silentWatchReload = true;
    loadFromUrl(queryState.url, { historyMode: "replace", parentUrl: queryState.parent }).catch((error) => {
      setStatus(error.message, "error");
    }).finally(() => {
      silentWatchReload = false;
    });
  }, WATCH_INTERVAL_MS);
}

function clearView({ keepUrl = false } = {}) {
  debugLog("clearView", { keepUrl });
  currentView = null;
  currentTypeFilter = "";
  updateDocumentTitle(null);
  resultPanel.hidden = true;
  mobileListNode.hidden = true;
  mobileReloadButton.hidden = true;
  clearButton.hidden = true;
  controlsPanel.hidden = false;
  heroSection.hidden = false;
  resultKindNode.textContent = t("result.view");
  resultTitleNode.textContent = "-";
  backLinkNode.hidden = true;
  backLinkNode.href = "#";
  updateBookmarkButton(null);
  updateWatchButton(null);
  updateFideLink("");
  updateOriginalLink(keepUrl ? readQueryState(window.location.search).url : "");
  resultSubtitleNode.textContent = "";
  resultSubtitleNode.hidden = true;
  typeFilterWrapNode.hidden = true;
  typeFilterSelectNode.innerHTML = "";
  resultMetaNode.innerHTML = "";
  resultMetaLinksNode.innerHTML = "";
  resultMetaLinksNode.hidden = true;
  resultsHeadNode.innerHTML = "";
  resultsBodyNode.innerHTML = "";
  mobileListNode.innerHTML = "";

  if (!keepUrl) {
    writeQueryState(window.history, window.location.href, { url: "", parent: "" });
  }
}

function getTypeFilterOptions(view) {
  if (!view || view.kind !== "tournament") {
    return { columnIndex: -1, values: [] };
  }

  const columnIndex = findColumnIndex(view.columns, "Typ");
  return {
    columnIndex,
    values: collectUniqueColumnValues(view.rows, columnIndex)
  };
}

function normalizeTypeFilter(view) {
  const { values } = getTypeFilterOptions(view);
  if (!values.includes(currentTypeFilter)) {
    currentTypeFilter = "";
  }
}

function renderTypeFilter(view) {
  const { columnIndex, values } = getTypeFilterOptions(view);

  if (columnIndex === -1 || values.length === 0) {
    typeFilterWrapNode.hidden = true;
    typeFilterSelectNode.innerHTML = "";
    return;
  }

  typeFilterWrapNode.hidden = false;
  typeFilterSelectNode.innerHTML = [
    `<option value="">${escapeHtml(t("filter.allGroups"))}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
  ].join("");
  typeFilterSelectNode.value = values.includes(currentTypeFilter) ? currentTypeFilter : "";
}

function renderResult(view) {
  const sourceUrl = readQueryState(window.location.search).url;
  currentView = view;
  normalizeTypeFilter(view);
  const { columnIndex } = getTypeFilterOptions(view);
  const filteredView =
    view.kind === "tournament"
      ? {
          ...view,
          rows: filterRowsByColumnValue(view.rows, columnIndex, currentTypeFilter)
        }
      : view;
  const decoratedView = decorateViewWithBookmarks(filteredView);
  debugLog("renderResult", {
    kind: decoratedView.kind,
    title: decoratedView.title,
    subtitle: decoratedView.subtitle,
    chips: decoratedView.chips.length,
    columns: decoratedView.columns.map((column) => column.label),
    rows: decoratedView.rows.length,
    backUrl: decoratedView.backUrl,
    typeFilter: currentTypeFilter
  });
  updateDocumentTitle(decoratedView);
  resultKindNode.textContent = decoratedView.label;
  resultTitleNode.textContent = decoratedView.title;
  updateBookmarkButton(view);
  updateWatchButton(view);
  updateWatchedSnapshot(view, { notify: silentWatchReload });
  updateFideLink(decoratedView.fideUrl || "");
  updateOriginalLink(sourceUrl);

  if (decoratedView.kind === "player" && decoratedView.backUrl) {
    backLinkNode.href = buildInternalPageUrl(window.location.href, decoratedView.backUrl);
    backLinkNode.hidden = false;
  } else {
    backLinkNode.href = "#";
    backLinkNode.hidden = true;
  }

  resultSubtitleNode.textContent = decoratedView.subtitle || "";
  resultSubtitleNode.hidden = !decoratedView.subtitle;
  renderTypeFilter(view);
  resultMetaNode.innerHTML = decoratedView.chips.map((entry) => chip(entry.label, entry.value, entry)).join("");
  resultMetaLinksNode.innerHTML = (decoratedView.tournamentLinks || [])
    .map(
      (entry) =>
        `<a class="chip-link" href="${escapeHtml(buildInternalPageUrl(window.location.href, entry.href))}">${escapeHtml(entry.label)}</a>`
    )
    .join("");
  resultMetaLinksNode.hidden = !(decoratedView.tournamentLinks || []).length;
  resultsHeadNode.innerHTML = renderTableHead(decoratedView.columns);
  resultsBodyNode.innerHTML = renderTableRows(decoratedView.rows, window.location.href);
  mobileListNode.innerHTML = renderMobileRows(decoratedView.rows, window.location.href);

  resultPanel.hidden = false;
  mobileListNode.hidden = false;
  mobileReloadButton.hidden = false;
  clearButton.hidden = false;
  controlsPanel.hidden = true;
  heroSection.hidden = true;
}

typeFilterSelectNode.addEventListener("change", () => {
  currentTypeFilter = typeFilterSelectNode.value;
  if (currentView) {
    renderResult(currentView);
  }
});

bookmarkButtonNode.addEventListener("click", () => {
  const bookmarkKey = normalizeBookmarkName(bookmarkButtonNode.dataset.bookmarkKey);
  const playerName = normalizeBookmarkName(bookmarkButtonNode.dataset.playerName);
  const fideId = normalizeFideId(bookmarkButtonNode.dataset.fideId);
  if (!bookmarkKey) {
    return;
  }

  const bookmarks = readBookmarks();
  if (bookmarks[bookmarkKey]) {
    delete bookmarks[bookmarkKey];
    writeBookmarks(bookmarks);
    updateBookmarkButton(currentView);
    if (currentView) {
      renderResult(currentView);
    }
    setStatus(t("status.removedBookmark", { player: playerName || "player" }), "success");
    return;
  }

  bookmarks[bookmarkKey] = { name: playerName, fideId };
  writeBookmarks(bookmarks);
  updateBookmarkButton(currentView);
  if (currentView) {
    renderResult(currentView);
  }
  setStatus(t("status.bookmarked", { player: playerName || "player" }), "success");
});

watchButtonNode.addEventListener("click", async () => {
  if (!currentView || currentView.kind !== "player") return;
  const watchKey = getPlayerWatchKey(currentView);
  const playerName = normalizeBookmarkName(currentView.title) || "player";
  const watchedPlayers = readWatchedPlayers();
  if (watchedPlayers[watchKey]) {
    delete watchedPlayers[watchKey];
    writeWatchedPlayers(watchedPlayers);
    updateWatchButton(currentView);
    setStatus(t("status.watchStopped", { player: playerName }), "success");
    return;
  }

  watchedPlayers[watchKey] = {
    name: playerName,
    url: normalizeSupportedUrl(readQueryState(window.location.search).url),
    fideId: normalizeFideId(currentView.fideId || ""),
    snapshot: buildPlayerSnapshot(currentView),
    updatedAt: new Date().toISOString()
  };
  writeWatchedPlayers(watchedPlayers);
  updateWatchButton(currentView);

  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") setStatus(t("status.notificationsOn"), "success");
  }
  setStatus(t("status.watchStarted", { player: playerName }), "success");
});

function parseAndPrepareView(html, sourceUrl, parentUrl = "") {
  debugLog("parseAndPrepareView:start", { sourceUrl, parentUrl, htmlLength: html.length });
  const parsed = parseChessResultsPage(html, sourceUrl);
  debugLog("parseAndPrepareView:parsed", {
    kind: parsed.kind,
    title: parsed.title,
    rows: parsed.rows.length
  });
  return attachPlayerNavigation(parsed, parentUrl);
}

async function loadFromUrl(url, { historyMode = "replace", parentUrl = "" } = {}) {
  const normalizedUrl = normalizeSupportedUrl(url);
  const normalizedParentUrl = normalizeSupportedUrl(parentUrl);
  const wasNormalized = normalizedUrl !== url;
  const cacheBustToken = Date.now();
  const proxyUrl = PROXY_LOADER.buildUrl(normalizedUrl, cacheBustToken);

  debugLog("loadFromUrl:start", {
    url,
    normalizedUrl,
    parentUrl,
    normalizedParentUrl,
    historyMode,
    cacheBustToken,
    proxyUrl
  });

  if (!silentWatchReload) {
    setStatus(
      wasNormalized
        ? t("status.loadingNormalized", { proxy: PROXY_LOADER.name })
        : t("status.loading", { proxy: PROXY_LOADER.name })
    );
  }

  try {
    const response = await fetch(proxyUrl, { cache: "no-store" });
    debugLog("loadFromUrl:response", {
      ok: response.ok,
      status: response.status,
      redirected: response.redirected,
      finalUrl: response.url,
      contentType: response.headers.get("content-type")
    });
    if (!response.ok) {
      throw new Error(`Proxy request failed with status ${response.status}.`);
    }

    const html = await PROXY_LOADER.parseResponse(response);
    debugLog("loadFromUrl:html received", {
      length: html.length,
      firstChunk: html.slice(0, 200)
    });
    if (!html) {
      throw new Error("Proxy returned an empty response.");
    }

    const parsed = parseAndPrepareView(html, normalizedUrl, normalizedParentUrl);
    writeQueryState(
      window.history,
      window.location.href,
      { url: normalizedUrl, parent: parsed.backUrl || "" },
      historyMode
    );
    renderResult(parsed);
    updateOriginalLink(normalizedUrl);
    if (!silentWatchReload) {
      setStatus(
        wasNormalized
          ? t("status.loadedNormalized", { rows: parsed.rows.length })
          : t("status.loaded", { rows: parsed.rows.length, proxy: PROXY_LOADER.name }),
        "success"
      );
    }
  } catch (error) {
    debugLog("loadFromUrl:error", {
      message: error.message,
      stack: error.stack,
      url,
      normalizedUrl,
      parentUrl,
      normalizedParentUrl
    });
    throw new Error(`${PROXY_LOADER.name}: ${error.message} Use the HTML paste fallback below.`);
  }
}

function extractHiddenFields(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Object.fromEntries(
    [...doc.querySelectorAll('input[type="hidden"][name]')].map((input) => [input.name, input.value || ""])
  );
}

async function loadTournamentSearch({ dateFrom = "", dateTo = "", historyMode = "push" } = {}) {
  const country = TOURNAMENT_SEARCH_COUNTRY;
  const initialProxyUrl = PROXY_LOADER.buildUrl(TOURNAMENT_SEARCH_URL, Date.now());

  setStatus(t("status.searchPreparing", { proxy: PROXY_LOADER.name }));
  const initialResponse = await fetch(initialProxyUrl, { cache: "no-store" });
  if (!initialResponse.ok) {
    throw new Error(`Could not open tournament search with status ${initialResponse.status}.`);
  }
  const initialHtml = await PROXY_LOADER.parseResponse(initialResponse);
  const payload = buildTournamentSearchPayload({
    country,
    dateFrom,
    dateTo,
    hiddenFields: extractHiddenFields(initialHtml)
  });
  const proxyUrl = PROXY_LOADER.buildUrl(TOURNAMENT_SEARCH_URL, Date.now());

  setStatus(t("status.searchingTournaments", { proxy: PROXY_LOADER.name }));
  const response = await fetch(proxyUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString()
  });
  if (!response.ok) {
    throw new Error(`Tournament search failed with status ${response.status}.`);
  }
  const html = await PROXY_LOADER.parseResponse(response);
  const parsed = parseTournamentSearchPage(html, TOURNAMENT_SEARCH_URL);
  currentTypeFilter = "";
  searchDateFromInput.value = dateFrom;
  searchDateToInput.value = dateTo;
  writeQueryState(
    window.history,
    window.location.href,
    {
      searchFrom: dateFrom,
      searchTo: dateTo
    },
    historyMode
  );
  renderResult({
    ...parsed,
    title: `${parsed.title} · ${country}`,
    chips: [
      { label: t("label.country"), value: country },
      { label: t("label.endFrom"), value: dateFrom },
      { label: t("label.endTo"), value: dateTo }
    ].filter((entry) => entry.value)
  });
  updateOriginalLink(TOURNAMENT_SEARCH_URL);
  setStatus(t("status.tournamentsFound", { rows: parsed.rows.length }), "success");
}

async function loadPlayerSearch({ firstName = "", lastName = "", country = "", historyMode = "push" } = {}) {
  const normalizedCountry = country.trim().toUpperCase() || "LAT";
  const normalizedFirstName = firstName.trim();
  const normalizedLastName = lastName.trim();
  if (!normalizedFirstName && !normalizedLastName) {
    throw new Error("Enter a first name or last name for player search.");
  }

  const initialProxyUrl = PROXY_LOADER.buildUrl(PLAYER_SEARCH_URL, Date.now());
  setStatus(t("status.playerSearchPreparing", { proxy: PROXY_LOADER.name }));
  const initialResponse = await fetch(initialProxyUrl, { cache: "no-store" });
  if (!initialResponse.ok) {
    throw new Error(`Could not open player search with status ${initialResponse.status}.`);
  }
  const initialHtml = await PROXY_LOADER.parseResponse(initialResponse);
  const payload = buildPlayerSearchPayload({
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    country: normalizedCountry,
    hiddenFields: extractHiddenFields(initialHtml)
  });
  const proxyUrl = PROXY_LOADER.buildUrl(PLAYER_SEARCH_URL, Date.now());

  setStatus(t("status.searchingPlayers", { proxy: PROXY_LOADER.name }));
  const response = await fetch(proxyUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString()
  });
  if (!response.ok) {
    throw new Error(`Player search failed with status ${response.status}.`);
  }
  const html = await PROXY_LOADER.parseResponse(response);
  const parsed = parsePlayerSearchPage(html, PLAYER_SEARCH_URL);
  currentTypeFilter = "";
  playerFirstNameInput.value = normalizedFirstName;
  playerLastNameInput.value = normalizedLastName;
  playerCountryInput.value = normalizedCountry;
  writeQueryState(
    window.history,
    window.location.href,
    {
      playerFirstName: normalizedFirstName,
      playerLastName: normalizedLastName,
      playerCountry: normalizedCountry === "LAT" ? "" : normalizedCountry
    },
    historyMode
  );
  renderResult({
    ...parsed,
    title: `${parsed.title} · ${[normalizedFirstName, normalizedLastName].filter(Boolean).join(" ")} · ${normalizedCountry}`,
    chips: [
      { label: t("label.firstName"), value: normalizedFirstName },
      { label: t("label.lastName"), value: normalizedLastName },
      { label: t("label.country"), value: normalizedCountry }
    ].filter((entry) => entry.value)
  });
  updateOriginalLink(PLAYER_SEARCH_URL);
  setStatus(t("status.playersFound", { rows: parsed.rows.length }), "success");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  debugLog("form submit", { url });

  if (!url) {
    setStatus(t("status.enterUrl"), "error");
    return;
  }

  try {
    await loadFromUrl(url, { historyMode: "push" });
  } catch (error) {
    setStatus(t("status.proxyFallback", { message: error.message }), "error");
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loadTournamentSearch({
      dateFrom: searchDateFromInput.value,
      dateTo: searchDateToInput.value
    });
  } catch (error) {
    setStatus(
      `${error.message} The current public proxy can load tournament pages, but it cannot submit Chess-Results search forms. Open Tournament search on Chess-Results and paste a tournament link here.`,
      "error"
    );
    updateOriginalLink(TOURNAMENT_SEARCH_URL);
  }
});

playerSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loadPlayerSearch({
      firstName: playerFirstNameInput.value,
      lastName: playerLastNameInput.value,
      country: playerCountryInput.value
    });
  } catch (error) {
    setStatus(`${error.message} If the browser blocks search, open Player search on Chess-Results.`, "error");
  }
});

parseButton.addEventListener("click", () => {
  const html = htmlInput.value.trim();
  debugLog("parse button click", {
    urlInput: urlInput.value.trim(),
    htmlLength: html.length
  });
  if (!html) {
    setStatus(t("status.pasteHtml"), "error");
    return;
  }

  try {
    const queryState = readQueryState(window.location.search);
    const sourceUrl = normalizeSupportedUrl(urlInput.value.trim()) || normalizeSupportedUrl(queryState.url);
    const parsed = parseAndPrepareView(
      html,
      sourceUrl,
      normalizeSupportedUrl(queryState.parent)
    );
    if (sourceUrl) {
      writeQueryState(window.history, window.location.href, { url: sourceUrl, parent: parsed.backUrl || "" });
    }
    renderResult(parsed);
    updateOriginalLink(sourceUrl);
    setStatus(t("status.parsed", { rows: parsed.rows.length }), "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

demoButton.addEventListener("click", () => {
  debugLog("demo button click");
  htmlInput.value = DEMO_HTML;
  urlInput.value = DEMO_URL;

  try {
    const parsed = parseChessResultsPage(DEMO_HTML, DEMO_URL);
    writeQueryState(window.history, window.location.href, { url: DEMO_URL, parent: parsed.backUrl || "" }, "push");
    renderResult(parsed);
    updateOriginalLink(DEMO_URL);
    setStatus(t("status.demoLoaded", { player: parsed.title }), "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

mobileReloadButton.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  debugLog("mobile reload click", { url });

  if (!url) {
    setStatus(t("status.enterUrl"), "error");
    return;
  }

  try {
    await loadFromUrl(url, { historyMode: "replace", parentUrl: readQueryState(window.location.search).parent });
  } catch (error) {
    setStatus(error.message, "error");
  }
});

clearButton.addEventListener("click", () => {
  debugLog("clear button click");
  writeQueryState(window.history, window.location.href, { url: "", parent: "" }, "push");
  clearView({ keepUrl: true });
  urlInput.value = "";
  htmlInput.value = "";
  setStatus("");
});

resultPanel.addEventListener("click", async (event) => {
  const link = event.target.closest("a[href]");
  if (!link) {
    return;
  }

  const nextUrl = new URL(link.href, window.location.href);
  if (nextUrl.origin !== window.location.origin || nextUrl.pathname !== window.location.pathname) {
    return;
  }

  const targetUrl = nextUrl.searchParams.get("url");
  if (!targetUrl) {
    return;
  }

  debugLog("result panel internal navigation", {
    linkHref: link.href,
    targetUrl,
    currentSourceUrl: urlInput.value.trim()
  });
  event.preventDefault();
  const currentSourceUrl = urlInput.value.trim();
  const parentUrl = isTournamentUrl(currentSourceUrl) ? currentSourceUrl : readQueryState(window.location.search).parent;
  urlInput.value = targetUrl;

  try {
    await loadFromUrl(targetUrl, { historyMode: "push", parentUrl });
  } catch (error) {
    setStatus(error.message, "error");
  }
});

languageOptions.forEach((option) => {
  option.addEventListener("click", () => {
    currentLanguage = option.dataset.languageOption === "ru" ? "ru" : "en";
    window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    applyLanguage();
  });
});

applyLanguage();
scheduleWatchPolling();

playerCountryInput.value = playerCountryInput.value.trim().toUpperCase() || "LAT";


const initialState = readQueryState(window.location.search);
debugLog("initial query state", initialState);
if (initialState.url) {
  urlInput.value = initialState.url;
  updateOriginalLink(initialState.url);
  loadFromUrl(initialState.url, {
    historyMode: "replace",
    parentUrl: initialState.parent
  }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
} else if (initialState.playerFirstName || initialState.playerLastName) {
  playerFirstNameInput.value = initialState.playerFirstName;
  playerLastNameInput.value = initialState.playerLastName;
  playerCountryInput.value = (initialState.playerCountry || "LAT").trim().toUpperCase();
  loadPlayerSearch({
    firstName: playerFirstNameInput.value,
    lastName: playerLastNameInput.value,
    country: playerCountryInput.value,
    historyMode: "replace"
  }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
} else if (initialState.searchFrom || initialState.searchTo) {
  searchDateFromInput.value = initialState.searchFrom;
  searchDateToInput.value = initialState.searchTo;
  loadTournamentSearch({
    dateFrom: searchDateFromInput.value,
    dateTo: searchDateToInput.value,
    historyMode: "replace"
  }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(
      `${error.message} The current public proxy can load tournament pages, but it cannot submit Chess-Results search forms. Open Tournament search on Chess-Results and paste a tournament link here.`,
      "error"
    );
    updateOriginalLink(TOURNAMENT_SEARCH_URL);
  });
}

window.addEventListener("popstate", () => {
  const queryState = readQueryState(window.location.search);
  debugLog("popstate", queryState);

  if (!queryState.url) {
    if (queryState.playerFirstName || queryState.playerLastName) {
      playerFirstNameInput.value = queryState.playerFirstName;
      playerLastNameInput.value = queryState.playerLastName;
      playerCountryInput.value = (queryState.playerCountry || "LAT").trim().toUpperCase();
      loadPlayerSearch({
        firstName: playerFirstNameInput.value,
        lastName: playerLastNameInput.value,
        country: playerCountryInput.value,
        historyMode: "replace"
      }).catch((error) => {
        clearView({ keepUrl: true });
        setStatus(error.message, "error");
      });
      return;
    }

    if (queryState.searchFrom || queryState.searchTo) {
      searchDateFromInput.value = queryState.searchFrom;
      searchDateToInput.value = queryState.searchTo;
      loadTournamentSearch({
        dateFrom: searchDateFromInput.value,
        dateTo: searchDateToInput.value,
        historyMode: "replace"
      }).catch((error) => {
        clearView({ keepUrl: true });
        setStatus(error.message, "error");
      });
      return;
    }

    clearView({ keepUrl: true });
    urlInput.value = "";
    htmlInput.value = "";
    searchDateFromInput.value = "";
    searchDateToInput.value = "";
    playerFirstNameInput.value = "";
    playerLastNameInput.value = "";
    playerCountryInput.value = "LAT";
    setStatus("");
    return;
  }

  urlInput.value = queryState.url;
  updateOriginalLink(queryState.url);
  loadFromUrl(queryState.url, { historyMode: "replace", parentUrl: queryState.parent }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
});
