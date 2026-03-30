const DEMO_URL =
  "https://s3.chess-results.com/tnr1359649.aspx?lan=1&art=9&fed=LAT&turdet=YES&flag=30&snr=61&SNode=S0";

const DEMO_HTML = String.raw`<!DOCTYPE html>
<html lang="en">
<body>
<div class="defaultDialog" style="width: 985px; clear:both;"><h2>Player info</h2>
<table Class="CRs1" border="0" cellpadding="1" cellspacing="1" bgcolor=""><tr><td class="CR">Name</td><td class="CR">Zavalnijs, Grigorijs</td></tr><tr><td class="CR">Title</td><td class="CR">II</td></tr><tr><td class="CR">Starting rank</td><td class="CR">61</td></tr><tr><td class="CR">Rating</td><td class="CR">0</td></tr><tr><td class="CR">Rating national</td><td class="CR">0</td></tr><tr><td class="CR">Rating international</td><td class="CR">0</td></tr><tr><td class="CR">Performance rating</td><td class="CR">1309</td></tr><tr><td class="CR">Points</td><td class="CR">2</td></tr><tr><td class="CR">Rank</td><td class="CR">26</td></tr><tr><td class="CR">Federation</td><td class="CR">LAT</td></tr><tr><td class="CR">Club/City</td><td class="CR">J.Moisejeva</td></tr><tr><td class="CR">Ident-Number</td><td class="CR">0</td></tr><tr><td class="CR">Fide-ID</td><td class="CR">11653949</td></tr><tr><td class="CR">Year of birth </td><td class="CR">2019</td></tr></table><p Class="CRlz">&nbsp;</p>
<table class="CRs1" border="0" cellpadding="1" cellspacing="1">
<tr class="CRng1b"><th class="CRc">Rd.</th><th class="CRc">Bo.</th><th class="CRc">SNo</th><th class="CR"></th><th class="CR">Name</th><th class="CRr">Rtg</th><th class="CR">FED</th><th class="CR">Club/City</th><th class="CRc">Pts.</th><th class="CRc">Res.</th></tr>
<tr class="CRng2 LAT"><td class="CRc">1</td><td class="CRc">31</td><td class="CRc">-</td><td class="CR"></td><td class="CR">bye</td><td class="CRr">-</td><td class="CR">  -</td><td class="CR"></td><td class="CRc">-</td><td class="CRc">- 1</td><td></td><td></td></tr>
<tr class="CRng1 LAT"><td class="CRc">2</td><td class="CRc">10</td><td class="CRc">23</td><td class="CR">II</td><td class="CR"><a Class="CRdb" href="https://chess-results.com/tnr1359649.aspx?lan=1&amp;art=9&amp;fed=LAT&amp;turdet=YES&amp;flag=30&amp;snr=23">Barasovs, Dimitrijs</a></td><td class="CRr">1468</td><td class="CR">LAT</td><td class="CR">Jazdanovs/Mifan chess</td><td class="CRc">3,5</td><td class="CR"><table><tr><td><div class="FarbewT"></div></td><td class="CR">0</td></tr></table></td><td></td><td></td></tr>
<tr class="CRng2 LAT"><td class="CRc">3</td><td class="CRc">19</td><td class="CRc">33</td><td class="CR">II</td><td class="CR"><a Class="CRdb" href="https://chess-results.com/tnr1359649.aspx?lan=1&amp;art=9&amp;fed=LAT&amp;turdet=YES&amp;flag=30&amp;snr=33">Vanaga, Patricija</a></td><td class="CRr">1425</td><td class="CR">LAT</td><td class="CR">A.B. &#352;ahs/B&#275;ti&#326;&#353;</td><td class="CRc">2</td><td class="CR"><table><tr><td><div class="FarbesT"></div></td><td class="CR">1</td></tr></table></td><td></td><td></td></tr>
<tr class="CRng1 LAT"><td class="CRc">4</td><td class="CRc">15</td><td class="CRc">40</td><td class="CR">II</td><td class="CR"><a Class="CRdb" href="https://chess-results.com/tnr1359649.aspx?lan=1&amp;art=9&amp;fed=LAT&amp;turdet=YES&amp;flag=30&amp;snr=40">Vanags, Karlis</a></td><td class="CRr">1410</td><td class="CR">LAT</td><td class="CR">Sigulda/Harlinska/Vanags</td><td class="CRc">3</td><td class="CR"><table><tr><td><div class="FarbewT"></div></td><td class="CR">0</td></tr></table></td><td></td><td></td></tr>
<tr class="CRng2 LAT"><td class="CRc">5</td><td class="CRc">21</td><td class="CRc">11</td><td class="CR">II</td><td class="CR"><a Class="CRdb" href="https://chess-results.com/tnr1359649.aspx?lan=1&amp;art=9&amp;fed=LAT&amp;turdet=YES&amp;flag=30&amp;snr=11">Merke, Lineta</a></td><td class="CRr">1532</td><td class="CR">LAT</td><td class="CR">R&#352;S/Maklakova</td><td class="CRc">1,5</td><td class="CR"><table><tr><td><div class="FarbesT"></div></td><td class="CR"></td></tr></table></td><td></td><td></td></tr>
</table></div>
</body>
</html>`;

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

const PROXY_LOADER = {
  name: "corsproxy.io",
  buildUrl: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  parseResponse: async (response) => response.text()
};

function setStatus(message, tone = "") {
  statusNode.textContent = message;
  statusNode.className = `status ${tone}`.trim();
}

function readUrlFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("url") || "";
}

function readParentUrlFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("parent") || "";
}

function writeUrlToQuery(url, parentUrl = "", mode = "replace") {
  const nextUrl = new URL(window.location.href);
  if (url) {
    nextUrl.searchParams.set("url", url);
  } else {
    nextUrl.searchParams.delete("url");
  }

  if (parentUrl) {
    nextUrl.searchParams.set("parent", parentUrl);
  } else {
    nextUrl.searchParams.delete("parent");
  }

  if (mode === "push") {
    window.history.pushState({}, "", nextUrl);
    return;
  }

  window.history.replaceState({}, "", nextUrl);
}

function buildInternalPageUrl(url, parentUrl = "") {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("url", url);
  if (parentUrl) {
    nextUrl.searchParams.set("parent", parentUrl);
  } else {
    nextUrl.searchParams.delete("parent");
  }
  return nextUrl.toString();
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
    writeUrlToQuery("");
  }
}

function normalizeCell(cell) {
  return cell.textContent.replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function chip(label, value) {
  if (!value) {
    return "";
  }
  return `<span>${escapeHtml(label)}: ${escapeHtml(value)}</span>`;
}

function getHeadingText(dialog) {
  const heading = dialog.querySelector("h2");
  return heading ? normalizeCell(heading) : "";
}

function cleanHeaderLabel(label, index) {
  if (label) {
    return label;
  }

  if (index === 3) {
    return "Title";
  }

  return `Col ${index + 1}`;
}

function shouldKeepTournamentColumn(label, index) {
  if (index === 2) {
    return false;
  }

  return !["sex", "FED", "TB2", "TB3", "K"].includes(label);
}

function isRightAlignedCell(cell) {
  return cell.className.includes("CRr");
}

function buildCell({ text = "", href = "", align = "", color = "", raw = "", isNumeric = false } = {}) {
  return {
    text,
    href,
    align,
    color,
    raw,
    isNumeric
  };
}

function parsePlayerPage(doc, sourceUrl = "") {
  const dialogs = [...doc.querySelectorAll(".defaultDialog")];
  const playerDialog = dialogs.find((dialog) => getHeadingText(dialog).toLowerCase() === "player info");

  if (!playerDialog) {
    throw new Error("Could not find the 'Player info' section in the provided HTML.");
  }

  const tables = playerDialog.querySelectorAll("table");
  if (tables.length < 2) {
    throw new Error("Could not find the opponent table inside the player section.");
  }

  const infoTable = tables[0];
  const opponentsTable = tables[1];
  const meta = {};

  for (const row of infoTable.querySelectorAll("tr")) {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 2) {
      meta[normalizeCell(cells[0])] = normalizeCell(cells[1]);
    }
  }

  const columns = [
    { key: "round", label: "Rd", align: "center" },
    { key: "board", label: "Bo", align: "center" },
    { key: "title", label: "Title" },
    { key: "name", label: "Name" },
    { key: "rating", label: "Rtg", align: "right" },
    { key: "club", label: "Club" },
    { key: "points", label: "Pts", align: "center" },
    { key: "color", label: "Clr", align: "center" },
    { key: "result", label: "Res", align: "center" }
  ];

  const rows = [];
  for (const row of opponentsTable.querySelectorAll("tr")) {
    if (row.querySelector("th")) {
      continue;
    }

    const cells = [...row.children].slice(0, 10);
    if (cells.length < 10) {
      continue;
    }

    const link = cells[4].querySelector("a");
    const url = link ? new URL(link.getAttribute("href"), sourceUrl || "https://chess-results.com").href : "";
    const color = cells[9].querySelector(".FarbewT")
      ? "white"
      : cells[9].querySelector(".FarbesT")
        ? "black"
        : "";

    rows.push({
      cells: [
        buildCell({ text: normalizeCell(cells[0]), align: "center" }),
        buildCell({ text: normalizeCell(cells[1]), align: "center" }),
        buildCell({ text: normalizeCell(cells[3]) }),
        buildCell({ text: normalizeCell(cells[4]), href: url }),
        buildCell({ text: normalizeCell(cells[5]), align: "right", isNumeric: true }),
        buildCell({ text: normalizeCell(cells[7]) }),
        buildCell({ text: normalizeCell(cells[8]), align: "center", isNumeric: true }),
        buildCell({ text: color ? color[0].toUpperCase() : "", align: "center", color, raw: color || "empty-color" }),
        buildCell({ text: normalizeCell(cells[9]), align: "center" })
      ],
      mobile: {
        topLeft: `Rd ${normalizeCell(cells[0]) || "-"} · Bo ${normalizeCell(cells[1]) || "-"}`,
        topRight: normalizeCell(cells[9]) || "-",
        topRightColor: color,
        title: `${normalizeCell(cells[3]) ? `${normalizeCell(cells[3])} ` : ""}${normalizeCell(cells[4]) || "-"}`,
        titleHref: url,
        details: [
          [normalizeCell(cells[5]) || "-", normalizeCell(cells[8]) || "-"].join(" · "),
          normalizeCell(cells[7]) || "-"
        ]
      }
    });
  }

  return {
    kind: "player",
    label: "Player",
    title: meta.Name || "Unknown player",
    subtitle: "",
    chips: [
      { label: "Title", value: meta.Title },
      { label: "Rank", value: meta.Rank },
      { label: "Points", value: meta.Points },
      { label: "Performance", value: meta["Performance rating"] },
      { label: "FED", value: meta.Federation },
      { label: "Club", value: meta["Club/City"] }
    ].filter((entry) => entry.value),
    backUrl: "",
    columns,
    rows
  };
}

function parseTournamentMeta(dialog) {
  const meta = {};

  for (const row of dialog.querySelectorAll("tr")) {
    const cells = row.querySelectorAll(":scope > td");
    if (cells.length >= 2) {
      const key = normalizeCell(cells[0]);
      const value = normalizeCell(cells[1]);
      if (key && value) {
        meta[key] = value;
      }
    }
  }

  const updateNode = dialog.querySelector(".CRsmall");
  if (updateNode) {
    const updateText = normalizeCell(updateNode);
    const updateMatch = updateText.match(/Last update\s+(.*?)(?:,\s*Creator\/Last Upload:|$)/i);
    if (updateMatch?.[1]) {
      meta["Last update"] = updateMatch[1].trim();
    }
  }

  return meta;
}

function parseTournamentPage(doc, sourceUrl = "") {
  const dialogs = [...doc.querySelectorAll(".defaultDialog")];
  const rankingDialog = dialogs.find((dialog) => {
    const heading = getHeadingText(dialog).toLowerCase();
    return heading.includes("ranking") && dialog.querySelector("table.CRs1");
  });

  if (!rankingDialog) {
    throw new Error("Could not find a tournament ranking table in the provided HTML.");
  }

  const metaDialog = dialogs.find((dialog) => dialog !== rankingDialog && getHeadingText(dialog) && dialog.querySelector("table"));
  if (!metaDialog) {
    throw new Error("Could not find the tournament details section in the provided HTML.");
  }

  const meta = parseTournamentMeta(metaDialog);
  const rankingTable = rankingDialog.querySelector("table.CRs1");
  const headerRow = rankingTable.querySelector("tr");
  const headerCells = [...headerRow.children];
  const keptIndexes = [];
  const columns = [];

  headerCells.forEach((cell, index) => {
    const label = cleanHeaderLabel(normalizeCell(cell).replace(/\u00a0/g, " ").trim(), index);
    if (!label || label === "Col 3") {
      return;
    }

    if (!shouldKeepTournamentColumn(label, index)) {
      return;
    }

    keptIndexes.push(index);
    columns.push({
      key: `col-${index}`,
      label,
      align: cell.className.includes("CRc") ? "center" : cell.className.includes("CRr") ? "right" : ""
    });
  });

  const rows = [];
  for (const row of rankingTable.querySelectorAll("tr")) {
    if (row.querySelector("th")) {
      continue;
    }

    const cells = [...row.children];
    if (cells.length < headerCells.length) {
      continue;
    }

    const mappedCells = keptIndexes.map((sourceIndex) => {
      const cell = cells[sourceIndex];
      const link = cell.querySelector("a");
      const href = link ? new URL(link.getAttribute("href"), sourceUrl || "https://chess-results.com").href : "";
      const text = normalizeCell(cell);

      return buildCell({
        text,
        href,
        align: columns[keptIndexes.indexOf(sourceIndex)]?.align || (isRightAlignedCell(cell) ? "right" : ""),
        isNumeric: isRightAlignedCell(cell)
      });
    });

    const nameCell = mappedCells.find((cell, index) => columns[index]?.label === "Name");
    const pointsCell = mappedCells.find((cell, index) => columns[index]?.label === "Pts.");
    const ratingCell = mappedCells.find((cell, index) => columns[index]?.label === "Rtg");
    const clubCell = mappedCells.find((cell, index) => columns[index]?.label === "Club/City");
    const rankCell = mappedCells.find((cell, index) => columns[index]?.label === "Rk.");

    rows.push({
      cells: mappedCells,
      mobile: {
        topLeft: `Rank ${rankCell?.text || "-"}`,
        topRight: `${pointsCell?.text || "-"} pts`,
        topRightColor: "",
        title: nameCell?.text || "-",
        titleHref: nameCell?.href || "",
        details: [
          [ratingCell?.text || "-", clubCell?.text || "-"].join(" · "),
          columns
            .slice(0, 5)
            .map((column, index) => {
              const value = mappedCells[index]?.text || "";
              if (!value || ["Rk.", "Name"].includes(column.label)) {
                return "";
              }
              return `${column.label} ${value}`;
            })
            .filter(Boolean)
            .join(" · ")
        ].filter(Boolean)
      }
    });
  }

  return {
    kind: "tournament",
    label: "Tournament",
    title: getHeadingText(metaDialog) || "Tournament",
    subtitle: getHeadingText(rankingDialog),
    chips: [
      { label: "FED", value: meta.Federation },
      { label: "Rounds", value: meta["Number of rounds"] },
      { label: "Type", value: meta["Tournament type"] },
      { label: "Control", value: meta["Time control (Rapid)"] || meta["Time control"] },
      { label: "Date", value: meta.Date },
      { label: "Updated", value: meta["Last update"] }
    ].filter((entry) => entry.value),
    backUrl: "",
    columns,
    rows
  };
}

function parseChessResultsPage(html, sourceUrl = "") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const hasPlayerInfo = [...doc.querySelectorAll(".defaultDialog h2")].some(
    (heading) => normalizeCell(heading).toLowerCase() === "player info"
  );

  return hasPlayerInfo ? parsePlayerPage(doc, sourceUrl) : parseTournamentPage(doc, sourceUrl);
}

function renderColorMarker(color) {
  if (color === "white") {
    return '<span class="color-dot white" aria-label="White"></span>';
  }

  if (color === "black") {
    return '<span class="color-dot black" aria-label="Black"></span>';
  }

  return '<span class="color-dot empty" aria-hidden="true"></span>';
}

function renderCellContent(cell) {
  const content =
    cell.raw === "white" || cell.raw === "black" || cell.raw === "empty-color"
      ? renderColorMarker(cell.raw)
      : escapeHtml(cell.text || "-");

  if (cell.href) {
    return `<a href="${escapeHtml(buildInternalPageUrl(cell.href, cell.parentUrl || ""))}">${content}</a>`;
  }

  return content;
}

function renderTableHead(columns) {
  return `
    <tr>
      ${columns
        .map((column) => `<th class="${column.align ? `align-${column.align}` : ""}">${escapeHtml(column.label)}</th>`)
        .join("")}
    </tr>
  `;
}

function renderTableRows(rows) {
  return rows
    .map(
      (row) => `
        <tr>
          ${row.cells
            .map(
              (cell) =>
                `<td class="${cell.align ? `align-${cell.align}` : ""}">${renderCellContent(cell)}</td>`
            )
            .join("")}
        </tr>
      `
    )
    .join("");
}

function renderMobileRows(rows) {
  return rows
    .map((row) => {
      const title = row.mobile.titleHref
        ? `<a href="${escapeHtml(buildInternalPageUrl(row.mobile.titleHref, row.mobile.parentUrl || ""))}">${escapeHtml(row.mobile.title)}</a>`
        : escapeHtml(row.mobile.title);
      const sideMarker = row.mobile.topRightColor ? `${renderColorMarker(row.mobile.topRightColor)} ` : "";

      return `
        <article class="mobile-card">
          <div class="mobile-card-top">
            <span>${escapeHtml(row.mobile.topLeft)}</span>
            <span class="mobile-card-side">${sideMarker}${escapeHtml(row.mobile.topRight)}</span>
          </div>
          <h3>${title}</h3>
          ${row.mobile.details
            .map((detail, index) => `<p class="${index === row.mobile.details.length - 1 ? "mobile-club" : ""}">${escapeHtml(detail)}</p>`)
            .join("")}
        </article>
      `;
    })
    .join("");
}

function renderResult(view) {
  resultKindNode.textContent = view.label;
  resultTitleNode.textContent = view.title;
  if (view.kind === "player" && view.backUrl) {
    backLinkNode.href = buildInternalPageUrl(view.backUrl);
    backLinkNode.hidden = false;
  } else {
    backLinkNode.href = "#";
    backLinkNode.hidden = true;
  }
  resultSubtitleNode.textContent = view.subtitle || "";
  resultSubtitleNode.hidden = !view.subtitle;
  resultMetaNode.innerHTML = view.chips.map((entry) => chip(entry.label, entry.value)).join("");
  resultsHeadNode.innerHTML = renderTableHead(view.columns);
  resultsBodyNode.innerHTML = renderTableRows(view.rows);
  mobileListNode.innerHTML = renderMobileRows(view.rows);

  resultPanel.hidden = false;
  mobileListNode.hidden = false;
  mobileReloadButton.hidden = false;
  clearButton.hidden = false;
  controlsPanel.hidden = true;
  heroSection.hidden = true;
}

function isTournamentUrl(url) {
  try {
    return new URL(url).searchParams.get("art") === "1";
  } catch {
    return false;
  }
}

function attachPlayerBackLinks(view, parentUrl) {
  if (view.kind !== "player" || !parentUrl) {
    return view;
  }

  const nextRows = view.rows.map((row) => ({
    ...row,
    cells: row.cells.map((cell) => ({ ...cell, parentUrl })),
    mobile: {
      ...row.mobile,
      parentUrl
    }
  }));

  return {
    ...view,
    backUrl: parentUrl,
    rows: nextRows
  };
}

async function loadFromUrl(url, { historyMode = "replace", parentUrl = "" } = {}) {
  setStatus(`Loading Chess-Results page via ${PROXY_LOADER.name}...`);

  try {
    const response = await fetch(PROXY_LOADER.buildUrl(url));
    if (!response.ok) {
      throw new Error(`Proxy request failed with status ${response.status}.`);
    }

    const html = await PROXY_LOADER.parseResponse(response);
    if (!html) {
      throw new Error("Proxy returned an empty response.");
    }

    const parsed = attachPlayerBackLinks(parseChessResultsPage(html, url), parentUrl);
    renderResult(parsed);
    writeUrlToQuery(url, parsed.backUrl || "", historyMode);
    setStatus(`Loaded ${parsed.rows.length} rows via ${PROXY_LOADER.name}.`, "success");
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
    const parsed = parseChessResultsPage(html, urlInput.value.trim());
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
    await loadFromUrl(url, { historyMode: "replace", parentUrl: readParentUrlFromQuery() });
  } catch (error) {
    setStatus(error.message, "error");
  }
});

clearButton.addEventListener("click", () => {
  writeUrlToQuery("", "", "push");
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
  const parentUrl = isTournamentUrl(currentSourceUrl) ? currentSourceUrl : readParentUrlFromQuery();
  urlInput.value = targetUrl;

  try {
    await loadFromUrl(targetUrl, { historyMode: "push", parentUrl });
  } catch (error) {
    setStatus(error.message, "error");
  }
});

const initialUrl = readUrlFromQuery();
const initialParentUrl = readParentUrlFromQuery();
if (initialUrl) {
  urlInput.value = initialUrl;
  loadFromUrl(initialUrl, { historyMode: "replace", parentUrl: initialParentUrl }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
}

window.addEventListener("popstate", () => {
  const url = readUrlFromQuery();
  const parentUrl = readParentUrlFromQuery();

  if (!url) {
    clearView({ keepUrl: true });
    urlInput.value = "";
    htmlInput.value = "";
    setStatus("");
    return;
  }

  urlInput.value = url;
  loadFromUrl(url, { historyMode: "replace", parentUrl }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
});
