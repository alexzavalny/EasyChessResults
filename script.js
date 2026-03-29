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
const controlsPanel = document.querySelector("#controls-panel");
const urlInput = document.querySelector("#url-input");
const htmlInput = document.querySelector("#html-input");
const parseButton = document.querySelector("#parse-button");
const demoButton = document.querySelector("#demo-button");
const statusNode = document.querySelector("#status");
const resultPanel = document.querySelector("#result-panel");
const playerNameNode = document.querySelector("#player-name");
const playerMetaNode = document.querySelector("#player-meta");
const opponentsBodyNode = document.querySelector("#opponents-body");
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

function writeUrlToQuery(url, mode = "replace") {
  const nextUrl = new URL(window.location.href);
  if (url) {
    nextUrl.searchParams.set("url", url);
  } else {
    nextUrl.searchParams.delete("url");
  }

  if (mode === "push") {
    window.history.pushState({}, "", nextUrl);
    return;
  }

  window.history.replaceState({}, "", nextUrl);
}

function buildInternalPlayerUrl(url) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("url", url);
  return nextUrl.toString();
}

function clearView({ keepUrl = false } = {}) {
  resultPanel.hidden = true;
  mobileListNode.hidden = true;
  mobileReloadButton.hidden = true;
  clearButton.hidden = true;
  controlsPanel.hidden = false;
  playerNameNode.textContent = "-";
  playerMetaNode.innerHTML = "";
  opponentsBodyNode.innerHTML = "";
  mobileListNode.innerHTML = "";

  if (!keepUrl) {
    writeUrlToQuery("");
  }
}

function normalizeCell(cell) {
  return cell.textContent.replace(/\s+/g, " ").trim();
}

function parsePlayerPage(html, sourceUrl = "") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const dialogs = [...doc.querySelectorAll(".defaultDialog")];
  const playerDialog = dialogs.find((dialog) => {
    const heading = dialog.querySelector("h2");
    return heading && heading.textContent.trim().toLowerCase() === "player info";
  });

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
    rows.push({
      round: normalizeCell(cells[0]),
      board: normalizeCell(cells[1]),
      sno: normalizeCell(cells[2]),
      title: normalizeCell(cells[3]),
      name: normalizeCell(cells[4]),
      rating: normalizeCell(cells[5]),
      federation: normalizeCell(cells[6]),
      club: normalizeCell(cells[7]),
      points: normalizeCell(cells[8]),
      result: normalizeCell(cells[9]),
      color: cells[9].querySelector(".FarbewT")
        ? "white"
        : cells[9].querySelector(".FarbesT")
          ? "black"
          : "",
      url: link ? new URL(link.getAttribute("href"), sourceUrl || "https://chess-results.com").href : ""
    });
  }

  return {
    meta,
    rows
  };
}

function chip(label, value) {
  if (!value) {
    return "";
  }
  return `<span>${label}: ${value}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function renderResult({ meta, rows }) {
  playerNameNode.textContent = meta.Name || "Unknown player";
  playerMetaNode.innerHTML = [
    chip("Title", meta.Title),
    chip("Rank", meta.Rank),
    chip("Points", meta.Points),
    chip("Performance", meta["Performance rating"]),
    chip("FED", meta.Federation),
    chip("Club", meta["Club/City"])
  ]
    .filter(Boolean)
    .join("");

  opponentsBodyNode.innerHTML = rows
    .map((row) => {
      const nameCell = row.url
        ? `<a href="${escapeHtml(buildInternalPlayerUrl(row.url))}">${escapeHtml(row.name || "-")}</a>`
        : escapeHtml(row.name || "-");

      return `
        <tr>
          <td>${escapeHtml(row.round || "-")}</td>
          <td>${escapeHtml(row.board || "-")}</td>
          <td>${escapeHtml(row.title || "-")}</td>
          <td>${nameCell}</td>
          <td>${escapeHtml(row.rating || "-")}</td>
          <td>${escapeHtml(row.club || "-")}</td>
          <td>${escapeHtml(row.points || "-")}</td>
          <td>${renderColorMarker(row.color)}</td>
          <td>${escapeHtml(row.result || "-")}</td>
        </tr>
      `;
    })
    .join("");

  mobileListNode.innerHTML = rows
    .map((row) => {
      const title = row.title ? `${row.title} ` : "";
      const nameLine = row.url
        ? `<a href="${escapeHtml(buildInternalPlayerUrl(row.url))}">${escapeHtml(title)}${escapeHtml(row.name || "-")}</a>`
        : `${escapeHtml(title)}${escapeHtml(row.name || "-")}`;

      return `
        <article class="mobile-card">
          <div class="mobile-card-top">
            <span>Rd ${escapeHtml(row.round || "-")}</span>
            <span class="mobile-card-side">${renderColorMarker(row.color)} ${escapeHtml(row.result || "-")}</span>
          </div>
          <h3>${nameLine}</h3>
          <p>${escapeHtml(row.rating || "-")} · ${escapeHtml(row.points || "-")}</p>
          <p class="mobile-club">${escapeHtml(row.club || "-")}</p>
        </article>
      `;
    })
    .join("");

  resultPanel.hidden = false;
  mobileListNode.hidden = false;
  mobileReloadButton.hidden = false;
  clearButton.hidden = false;
  controlsPanel.hidden = true;
}

async function loadFromUrl(url, { historyMode = "replace" } = {}) {
  setStatus(`Loading player page via ${PROXY_LOADER.name}...`);

  try {
    const response = await fetch(PROXY_LOADER.buildUrl(url));
    if (!response.ok) {
      throw new Error(`Proxy request failed with status ${response.status}.`);
    }

    const html = await PROXY_LOADER.parseResponse(response);
    if (!html) {
      throw new Error("Proxy returned an empty response.");
    }

    const parsed = parsePlayerPage(html, url);
    renderResult(parsed);
    writeUrlToQuery(url, historyMode);
    setStatus(`Loaded ${parsed.rows.length} rows via ${PROXY_LOADER.name}.`, "success");
  } catch (error) {
    throw new Error(`${PROXY_LOADER.name}: ${error.message} Use the HTML paste fallback below.`);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();

  if (!url) {
    setStatus("Enter a Chess-Results player page URL.", "error");
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
    setStatus("Paste the full player page HTML first.", "error");
    return;
  }

  try {
    const parsed = parsePlayerPage(html, urlInput.value.trim());
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
    const parsed = parsePlayerPage(DEMO_HTML, DEMO_URL);
    renderResult(parsed);
    setStatus(`Loaded demo data for ${parsed.meta.Name}.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

mobileReloadButton.addEventListener("click", async () => {
  const url = urlInput.value.trim();

  if (!url) {
    setStatus("Enter a Chess-Results player page URL.", "error");
    return;
  }

  try {
    await loadFromUrl(url, { historyMode: "replace" });
  } catch (error) {
    setStatus(error.message, "error");
  }
});

clearButton.addEventListener("click", () => {
  writeUrlToQuery("", "push");
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

  const targetPlayerUrl = nextUrl.searchParams.get("url");
  if (!targetPlayerUrl) {
    return;
  }

  event.preventDefault();
  urlInput.value = targetPlayerUrl;

  try {
    await loadFromUrl(targetPlayerUrl, { historyMode: "push" });
  } catch (error) {
    setStatus(error.message, "error");
  }
});

const initialUrl = readUrlFromQuery();
if (initialUrl) {
  urlInput.value = initialUrl;
  loadFromUrl(initialUrl, { historyMode: "replace" }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
}

window.addEventListener("popstate", () => {
  const url = readUrlFromQuery();

  if (!url) {
    clearView({ keepUrl: true });
    urlInput.value = "";
    htmlInput.value = "";
    setStatus("");
    return;
  }

  urlInput.value = url;
  loadFromUrl(url, { historyMode: "replace" }).catch((error) => {
    clearView({ keepUrl: true });
    setStatus(error.message, "error");
  });
});
