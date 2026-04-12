const form = document.querySelector("#load-form");
const heroSection = document.querySelector("#hero-section");
const controlsPanel = document.querySelector("#controls-panel");
const urlInput = document.querySelector("#url-input");
const htmlInput = document.querySelector("#html-input");
const parseButton = document.querySelector("#parse-button");
const demoButton = document.querySelector("#demo-button");
const statusNode = document.querySelector("#status");
const resultPanel = document.querySelector("#result-panel");
const resultKindNode = document.querySelector("#result-kind");
const resultTitleNode = document.querySelector("#result-title");
const backLinkNode = document.querySelector("#back-link");
const bookmarkButtonNode = document.querySelector("#bookmark-button");
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
  prependBookmarkMarker,
  readQueryState,
  renderMobileRows,
  renderTableHead,
  renderTableRows,
  writeQueryState
} = window.ChessResults;

const BOOKMARK_STORAGE_KEY = "easy-chess-results:bookmarked-players";
let currentView = null;
let currentTypeFilter = "";

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
  if (!window.localStorage) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeBookmarks(bookmarks) {
  if (!window.localStorage) {
    return;
  }

  window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
}

function normalizeBookmarkName(name = "") {
  return String(name || "").replace(/^(🔖|⭐)\s+/g, "").trim();
}

function updateBookmarkButton(view = null) {
  const playerName = normalizeBookmarkName(view?.title || "");
  if (view?.kind !== "player" || !playerName) {
    bookmarkButtonNode.hidden = true;
    bookmarkButtonNode.textContent = "Bookmark";
    bookmarkButtonNode.dataset.bookmarkKey = "";
    bookmarkButtonNode.dataset.playerName = "";
    bookmarkButtonNode.dataset.fideId = "";
    return;
  }

  const bookmarked = Boolean(readBookmarks()[playerName]);
  bookmarkButtonNode.hidden = false;
  bookmarkButtonNode.textContent = bookmarked ? "Bookmarked" : "Bookmark";
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
  resultKindNode.textContent = "View";
  resultTitleNode.textContent = "-";
  backLinkNode.hidden = true;
  backLinkNode.href = "#";
  updateBookmarkButton(null);
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
    '<option value="">All groups</option>',
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
    setStatus(`Removed bookmark for ${playerName || "player"}.`, "success");
    return;
  }

  bookmarks[bookmarkKey] = { name: playerName, fideId };
  writeBookmarks(bookmarks);
  updateBookmarkButton(currentView);
  if (currentView) {
    renderResult(currentView);
  }
  setStatus(`Bookmarked ${playerName || "player"}.`, "success");
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

  setStatus(
    wasNormalized
      ? `Loading supported Chess-Results view via ${PROXY_LOADER.name}...`
      : `Loading Chess-Results page via ${PROXY_LOADER.name}...`
  );

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
    setStatus(
      wasNormalized
        ? `Loaded ${parsed.rows.length} rows. Converted unsupported art=0 link to ranking view (art=1).`
        : `Loaded ${parsed.rows.length} rows via ${PROXY_LOADER.name}.`,
      "success"
    );
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  debugLog("form submit", { url });

  if (!url) {
    setStatus("Enter a Chess-Results page URL.", "error");
    return;
  }

  try {
    await loadFromUrl(url, { historyMode: "push" });
  } catch (error) {
    setStatus(
      `${error.message} If this is a browser CORS block, use the HTML paste fallback below.`,
      "error"
    );
  }
});

parseButton.addEventListener("click", () => {
  const html = htmlInput.value.trim();
  debugLog("parse button click", {
    urlInput: urlInput.value.trim(),
    htmlLength: html.length
  });
  if (!html) {
    setStatus("Paste the full Chess-Results page HTML first.", "error");
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
    setStatus(`Parsed ${parsed.rows.length} rows from pasted HTML.`, "success");
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
    setStatus(`Loaded demo data for ${parsed.title}.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

mobileReloadButton.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  debugLog("mobile reload click", { url });

  if (!url) {
    setStatus("Enter a Chess-Results page URL.", "error");
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
}

window.addEventListener("popstate", () => {
  const queryState = readQueryState(window.location.search);
  debugLog("popstate", queryState);

  if (!queryState.url) {
    clearView({ keepUrl: true });
    urlInput.value = "";
    htmlInput.value = "";
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
