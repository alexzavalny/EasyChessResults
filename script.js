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
const resultSubtitleNode = document.querySelector("#result-subtitle");
const resultMetaNode = document.querySelector("#result-meta");
const resultsHeadNode = document.querySelector("#results-head");
const resultsBodyNode = document.querySelector("#results-body");
const mobileListNode = document.querySelector("#mobile-list");
const mobileReloadButton = document.querySelector("#mobile-reload");
const clearButton = document.querySelector("#clear-button");

const {
  DEMO_HTML,
  DEMO_URL,
  PROXY_LOADER,
  attachPlayerNavigation,
  buildInternalPageUrl,
  chip,
  isTournamentUrl,
  normalizeSupportedUrl,
  parseChessResultsPage,
  readQueryState,
  renderMobileRows,
  renderTableHead,
  renderTableRows,
  writeQueryState
} = window.ChessResults;

function setStatus(message, tone = "") {
  statusNode.textContent = message;
  statusNode.className = `status ${tone}`.trim();
}

function clearView({ keepUrl = false } = {}) {
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
  resultSubtitleNode.textContent = "";
  resultSubtitleNode.hidden = true;
  resultMetaNode.innerHTML = "";
  resultsHeadNode.innerHTML = "";
  resultsBodyNode.innerHTML = "";
  mobileListNode.innerHTML = "";

  if (!keepUrl) {
    writeQueryState(window.history, window.location.href, { url: "", parent: "" });
  }
}

function renderResult(view) {
  resultKindNode.textContent = view.label;
  resultTitleNode.textContent = view.title;

  if (view.kind === "player" && view.backUrl) {
    backLinkNode.href = buildInternalPageUrl(window.location.href, view.backUrl);
    backLinkNode.hidden = false;
  } else {
    backLinkNode.href = "#";
    backLinkNode.hidden = true;
  }

  resultSubtitleNode.textContent = view.subtitle || "";
  resultSubtitleNode.hidden = !view.subtitle;
  resultMetaNode.innerHTML = view.chips.map((entry) => chip(entry.label, entry.value)).join("");
  resultsHeadNode.innerHTML = renderTableHead(view.columns);
  resultsBodyNode.innerHTML = renderTableRows(view.rows, window.location.href);
  mobileListNode.innerHTML = renderMobileRows(view.rows, window.location.href);

  resultPanel.hidden = false;
  mobileListNode.hidden = false;
  mobileReloadButton.hidden = false;
  clearButton.hidden = false;
  controlsPanel.hidden = true;
  heroSection.hidden = true;
}

function parseAndPrepareView(html, sourceUrl, parentUrl = "") {
  return attachPlayerNavigation(parseChessResultsPage(html, sourceUrl), parentUrl);
}

async function loadFromUrl(url, { historyMode = "replace", parentUrl = "" } = {}) {
  const normalizedUrl = normalizeSupportedUrl(url);
  const normalizedParentUrl = normalizeSupportedUrl(parentUrl);
  const wasNormalized = normalizedUrl !== url;

  setStatus(
    wasNormalized
      ? `Loading supported Chess-Results view via ${PROXY_LOADER.name}...`
      : `Loading Chess-Results page via ${PROXY_LOADER.name}...`
  );

  try {
    const response = await fetch(PROXY_LOADER.buildUrl(normalizedUrl));
    if (!response.ok) {
      throw new Error(`Proxy request failed with status ${response.status}.`);
    }

    const html = await PROXY_LOADER.parseResponse(response);
    if (!html) {
      throw new Error("Proxy returned an empty response.");
    }

    const parsed = parseAndPrepareView(html, normalizedUrl, normalizedParentUrl);
    renderResult(parsed);
    writeQueryState(
      window.history,
      window.location.href,
      { url: normalizedUrl, parent: parsed.backUrl || "" },
      historyMode
    );
    setStatus(
      wasNormalized
        ? `Loaded ${parsed.rows.length} rows. Converted unsupported art=0 link to ranking view (art=1).`
        : `Loaded ${parsed.rows.length} rows via ${PROXY_LOADER.name}.`,
      "success"
    );
  } catch (error) {
    throw new Error(`${PROXY_LOADER.name}: ${error.message} Use the HTML paste fallback below.`);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();

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
  if (!html) {
    setStatus("Paste the full Chess-Results page HTML first.", "error");
    return;
  }

  try {
    const queryState = readQueryState(window.location.search);
    const parsed = parseAndPrepareView(
      html,
      normalizeSupportedUrl(urlInput.value.trim()),
      normalizeSupportedUrl(queryState.parent)
    );
    renderResult(parsed);
    setStatus(`Parsed ${parsed.rows.length} rows from pasted HTML.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

demoButton.addEventListener("click", () => {
  htmlInput.value = DEMO_HTML;
  urlInput.value = DEMO_URL;

  try {
    const parsed = parseChessResultsPage(DEMO_HTML, DEMO_URL);
    renderResult(parsed);
    setStatus(`Loaded demo data for ${parsed.title}.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

mobileReloadButton.addEventListener("click", async () => {
  const url = urlInput.value.trim();

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
if (initialState.url) {
  urlInput.value = initialState.url;
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

  if (!queryState.url) {
    clearView({ keepUrl: true });
    urlInput.value = "";
    htmlInput.value = "";
    setStatus("");
    return;
  }

  urlInput.value = queryState.url;
  loadFromUrl(queryState.url, { historyMode: "replace", parentUrl: queryState.parent }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
});
