(function (root, factory) {
  const exported = factory(root);

  if (typeof module === "object" && module.exports) {
    module.exports = exported;
  }

  root.ChessResults = exported;
})(typeof globalThis !== "undefined" ? globalThis : this, (root) => {
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

  const PROXY_LOADER = {
    name: "corsproxy.io",
    buildUrl: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    parseResponse: async (response) => response.text()
  };

  function debugLog(...args) {
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log("[EasyChessResults]", ...args);
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

  function highlightPlayerName(value) {
    const text = String(value || "").trim();
    return text.includes("Zavalnijs") ? `⭐ ${text} ⭐` : text;
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

  function cleanHeaderLabel(label, index, sampleCell = null) {
    if (label) {
      return label;
    }

    if (index === 3) {
      return "Title";
    }

    if (sampleCell) {
      const sampleText = normalizeCell(sampleCell);
      if (sampleText && /^(W?FM|W?IM|W?GM|CM|WCM|I|II|III|IV|V|MK|NM|FM|IM|GM|AFM)$/.test(sampleText)) {
        return "Title";
      }
    }

    return `Col ${index + 1}`;
  }

  function shouldKeepTournamentColumn(label) {
    return !["sex", "FED", "TB2", "TB3", "K"].includes(label);
  }

  function isRightAlignedCell(cell) {
    return cell.className.includes("CRr");
  }

  function buildCell({ text = "", href = "", align = "", color = "", raw = "", isNumeric = false } = {}) {
    return { text, href, align, color, raw, isNumeric };
  }

  function readQueryState(search) {
    const params = new URLSearchParams(search);
    return {
      url: params.get("url") || "",
      parent: params.get("parent") || ""
    };
  }

  function createAppUrl(baseHref, { url = "", parent = "" } = {}) {
    const nextUrl = new URL(baseHref);

    if (url) {
      nextUrl.searchParams.set("url", url);
    } else {
      nextUrl.searchParams.delete("url");
    }

    if (parent) {
      nextUrl.searchParams.set("parent", parent);
    } else {
      nextUrl.searchParams.delete("parent");
    }

    return nextUrl.toString();
  }

  function writeQueryState(historyObject, baseHref, nextState, mode = "replace") {
    const nextUrl = createAppUrl(baseHref, nextState);
    if (mode === "push") {
      historyObject.pushState({}, "", nextUrl);
      return nextUrl;
    }

    historyObject.replaceState({}, "", nextUrl);
    return nextUrl;
  }

  function buildInternalPageUrl(baseHref, url, parent = "") {
    return createAppUrl(baseHref, { url, parent });
  }

  function normalizeSupportedUrl(inputUrl) {
    try {
      const nextUrl = new URL(inputUrl);
      if (nextUrl.searchParams.get("art") === "0") {
        nextUrl.searchParams.set("art", "1");
      }
      return nextUrl.toString();
    } catch {
      return inputUrl;
    }
  }

  function resolveLinkedUrl(href, sourceUrl) {
    if (!href) {
      return "";
    }

    return new URL(href, sourceUrl || "https://chess-results.com").href;
  }

  function extractColor(cell) {
    if (cell.querySelector(".FarbewT")) {
      return "white";
    }

    if (cell.querySelector(".FarbesT")) {
      return "black";
    }

    return "";
  }

  function parsePlayerPage(doc, sourceUrl = "") {
    const dialogs = [...doc.querySelectorAll(".defaultDialog")];
    debugLog("parsePlayerPage: dialog headings", dialogs.map((dialog) => getHeadingText(dialog)));
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
      const url = resolveLinkedUrl(link?.getAttribute("href"), sourceUrl);
      const color = extractColor(cells[9]);

      rows.push({
        cells: [
          buildCell({ text: normalizeCell(cells[0]), align: "center" }),
          buildCell({ text: normalizeCell(cells[1]), align: "center" }),
          buildCell({ text: normalizeCell(cells[3]) }),
          buildCell({ text: highlightPlayerName(normalizeCell(cells[4])), href: url }),
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
          title: highlightPlayerName(`${normalizeCell(cells[3]) ? `${normalizeCell(cells[3])} ` : ""}${normalizeCell(cells[4]) || "-"}`),
          titleHref: url,
          details: [
            [normalizeCell(cells[5]) || "-", normalizeCell(cells[8]) || "-"].join(" · "),
            normalizeCell(cells[7]) || "-"
          ]
        }
      });
    }

    debugLog("parsePlayerPage: parsed rows", rows.length, "title", meta.Name || "Unknown player");

    return {
      kind: "player",
      label: "Player",
      title: highlightPlayerName(meta.Name) || "Unknown player",
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

  function isFlagColumn(sampleCell) {
    if (!sampleCell) {
      return false;
    }

    const hasFlagMarker = !!sampleCell.querySelector('div[class*="tn_"]');
    return hasFlagMarker && !normalizeCell(sampleCell);
  }

  function parseTournamentColumns(headerCells, sampleRowCells = []) {
    const keptIndexes = [];
    const columns = [];

    headerCells.forEach((cell, index) => {
      const label = cleanHeaderLabel(
        normalizeCell(cell).replace(/\u00a0/g, " ").trim(),
        index,
        sampleRowCells[index] || null
      );
      if (!label || !shouldKeepTournamentColumn(label)) {
        return;
      }

      if (label.startsWith("Col ") && isFlagColumn(sampleRowCells[index])) {
        return;
      }

      keptIndexes.push(index);
      columns.push({
        key: `col-${index}`,
        label,
        align: cell.className.includes("CRc") ? "center" : cell.className.includes("CRr") ? "right" : ""
      });
    });

    return { keptIndexes, columns };
  }

  function isTournamentRankingDialog(dialog) {
    const rankingTable = dialog.querySelector("table.CRs1");
    if (!rankingTable) {
      return false;
    }

    const heading = getHeadingText(dialog).toLowerCase();
    if (
      heading.includes("ranking") ||
      heading.includes("rank after round") ||
      heading.includes("starting rank")
    ) {
      return true;
    }

    const headerLabels = [...rankingTable.querySelectorAll("tr th")].map((cell) => normalizeCell(cell));
    return headerLabels.includes("Name") && (headerLabels.includes("Pts.") || headerLabels.includes("Rtg"));
  }

  function firstAvailableCell(lookup, labels) {
    for (const label of labels) {
      if (lookup[label]) {
        return lookup[label];
      }
    }

    return null;
  }

  function buildTournamentMobileSummary(columns, mappedCells) {
    return columns
      .slice(0, 5)
      .map((column, index) => {
        const value = mappedCells[index]?.text || "";
        if (!value || ["Rk.", "Name"].includes(column.label)) {
          return "";
        }

        return `${column.label} ${value}`;
      })
      .filter(Boolean)
      .join(" · ");
  }

  function parseTournamentPage(doc, sourceUrl = "") {
    const dialogs = [...doc.querySelectorAll(".defaultDialog")];
    const dialogHeadings = dialogs.map((dialog) => getHeadingText(dialog));
    debugLog("parseTournamentPage: dialog headings", dialogHeadings);
    const rankingDialog = dialogs.find((dialog) => isTournamentRankingDialog(dialog));

    if (!rankingDialog) {
      throw new Error(
        `Could not find a tournament ranking table in the provided HTML. Headings seen: ${dialogHeadings.join(" | ")}`
      );
    }

    const metaDialog = dialogs.find((dialog) => dialog !== rankingDialog && getHeadingText(dialog) && dialog.querySelector("table"));
    if (!metaDialog) {
      throw new Error(
        `Could not find the tournament details section in the provided HTML. Headings seen: ${dialogHeadings.join(" | ")}`
      );
    }

    const meta = parseTournamentMeta(metaDialog);
    const rankingTable = rankingDialog.querySelector("table.CRs1");
    const headerRow = rankingTable.querySelector("tr");
    const headerCells = [...headerRow.children];
    const sampleDataRow = [...rankingTable.querySelectorAll("tr")].find((row) => !row.querySelector("th"));
    const sampleRowCells = sampleDataRow ? [...sampleDataRow.children] : [];
    const { keptIndexes, columns } = parseTournamentColumns(headerCells, sampleRowCells);
    debugLog("parseTournamentPage: selected ranking heading", getHeadingText(rankingDialog));
    debugLog("parseTournamentPage: selected meta heading", getHeadingText(metaDialog));
    debugLog("parseTournamentPage: header labels", headerCells.map((cell) => normalizeCell(cell)));
    debugLog("parseTournamentPage: sample row", sampleRowCells.map((cell) => normalizeCell(cell)));
    debugLog("parseTournamentPage: kept column labels", columns.map((column) => column.label));
    const rows = [];

    for (const row of rankingTable.querySelectorAll("tr")) {
      if (row.querySelector("th")) {
        continue;
      }

      const cells = [...row.children];
      if (cells.length < headerCells.length) {
        continue;
      }

      const mappedCells = keptIndexes.map((sourceIndex, mappedIndex) => {
        const cell = cells[sourceIndex];
        const link = cell.querySelector("a");
        const href = resolveLinkedUrl(link?.getAttribute("href"), sourceUrl);
        const text = normalizeCell(cell);

        return buildCell({
          text,
          href,
          align: columns[mappedIndex]?.align || (isRightAlignedCell(cell) ? "right" : ""),
          isNumeric: isRightAlignedCell(cell)
        });
      });

      const lookup = Object.fromEntries(columns.map((column, index) => [column.label, mappedCells[index]]));
      if (lookup.Name) {
        lookup.Name.text = highlightPlayerName(lookup.Name.text);
      }
      const rankCell = firstAvailableCell(lookup, ["Rk.", "No."]);
      const scoreCell = firstAvailableCell(lookup, ["Pts.", "Rtg"]);
      const scoreSuffix = lookup["Pts."] ? " pts" : lookup.Rtg ? " rtg" : "";

      rows.push({
        cells: mappedCells,
        mobile: {
          topLeft: `${rankCell?.text ? `${rankCell === lookup["No."] ? "No." : "Rank"} ${rankCell.text}` : "Rank -"}`,
          topRight: `${scoreCell?.text || "-"}${scoreSuffix}`,
          topRightColor: "",
          title: lookup.Name?.text || "-",
          titleHref: lookup.Name?.href || "",
          details: [
            [lookup.Rtg?.text || "-", lookup["Club/City"]?.text || "-"].join(" · "),
            buildTournamentMobileSummary(columns, mappedCells)
          ].filter(Boolean)
        }
      });
    }

    debugLog("parseTournamentPage: parsed rows", rows.length, "title", getHeadingText(metaDialog) || "Tournament");

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
    if (typeof root.DOMParser !== "function") {
      throw new Error("DOMParser is not available in this environment.");
    }

    debugLog("parseChessResultsPage: sourceUrl", sourceUrl);
    debugLog("parseChessResultsPage: html length", html.length);
    const parser = new root.DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const h2Headings = [...doc.querySelectorAll(".defaultDialog h2")].map((heading) => normalizeCell(heading));
    const hasPlayerInfo = h2Headings.some((heading) => heading.toLowerCase() === "player info");
    debugLog("parseChessResultsPage: h2 headings", h2Headings);
    debugLog("parseChessResultsPage: page type", hasPlayerInfo ? "player" : "tournament");

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

  function renderCellContent(cell, baseHref) {
    const content =
      cell.raw === "white" || cell.raw === "black" || cell.raw === "empty-color"
        ? renderColorMarker(cell.raw)
        : escapeHtml(cell.text || "-");

    if (cell.href) {
      return `<a href="${escapeHtml(buildInternalPageUrl(baseHref, cell.href, cell.parentUrl || ""))}">${content}</a>`;
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

  function renderTableRows(rows, baseHref) {
    return rows
      .map(
        (row) => `
        <tr>
          ${row.cells
            .map(
              (cell) =>
                `<td class="${cell.align ? `align-${cell.align}` : ""}">${renderCellContent(cell, baseHref)}</td>`
            )
            .join("")}
        </tr>
      `
      )
      .join("");
  }

  function renderMobileRows(rows, baseHref) {
    return rows
      .map((row) => {
        const title = row.mobile.titleHref
          ? `<a href="${escapeHtml(buildInternalPageUrl(baseHref, row.mobile.titleHref, row.mobile.parentUrl || ""))}">${escapeHtml(row.mobile.title)}</a>`
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

  function isTournamentUrl(url) {
    try {
      return new URL(url).searchParams.get("art") === "1";
    } catch {
      return false;
    }
  }

  function attachPlayerNavigation(view, parentUrl) {
    if (view.kind !== "player" || !parentUrl) {
      debugLog("attachPlayerNavigation: skipped", { kind: view.kind, parentUrl });
      return view;
    }

    debugLog("attachPlayerNavigation: attaching parent url", parentUrl, "rows", view.rows.length);
    return {
      ...view,
      backUrl: parentUrl,
      rows: view.rows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) => ({ ...cell, parentUrl })),
        mobile: {
          ...row.mobile,
          parentUrl
        }
      }))
    };
  }

    return {
      DEMO_HTML,
      DEMO_URL,
      PROXY_LOADER,
      attachPlayerNavigation,
      buildCell,
      buildInternalPageUrl,
      chip,
      cleanHeaderLabel,
      createAppUrl,
      debugLog,
      escapeHtml,
      getHeadingText,
      highlightPlayerName,
      isRightAlignedCell,
    isTournamentUrl,
    normalizeSupportedUrl,
    normalizeCell,
    parseChessResultsPage,
    parsePlayerPage,
    parseTournamentColumns,
    isTournamentRankingDialog,
    parseTournamentMeta,
    parseTournamentPage,
    readQueryState,
    renderCellContent,
    renderColorMarker,
    renderMobileRows,
    renderTableHead,
    renderTableRows,
    shouldKeepTournamentColumn,
    writeQueryState
  };
});
