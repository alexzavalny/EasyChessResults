const test = require("node:test");
const assert = require("node:assert/strict");

const {
  attachPlayerNavigation,
  appendCacheBustParam,
  buildFideProfileUrl,
  buildInternalPageUrl,
  chip,
  collectUniqueColumnValues,
  cleanHeaderLabel,
  createAppUrl,
  detectTrendDirection,
  escapeHtml,
  filterRowsByColumnValue,
  findColumnIndex,
  highlightPlayerName,
  inferTournamentUrlFromPlayerUrl,
  isTournamentRankingDialog,
  normalizeFideId,
  normalizeSupportedUrl,
  parsePlayerPage,
  parseTournamentColumns,
  parseTournamentRoundLinks,
  parseTournamentSearchPage,
  parsePlayerSearchPage,
  prependBookmarkMarker,
  PROXY_LOADER,
  buildTournamentSearchPayload,
  buildPlayerSearchPayload,
  readQueryState,
  renderCellContent,
  renderColorMarker,
  renderMobileRows,
  shouldKeepTournamentColumn,
  writeQueryState
} = require("../lib/chess-results.js");

test("buildFideProfileUrl normalizes numeric ids", () => {
  assert.equal(buildFideProfileUrl("11655682"), "https://ratings.fide.com/profile/11655682");
  assert.equal(buildFideProfileUrl("Fide-ID: 11 655 682"), "https://ratings.fide.com/profile/11655682");
  assert.equal(buildFideProfileUrl(""), "");
});

test("normalizeFideId strips non-digits", () => {
  assert.equal(normalizeFideId("Fide-ID: 11 655 682"), "11655682");
  assert.equal(normalizeFideId(""), "");
});

test("readQueryState returns url parent and tournament search params", () => {
  assert.deepEqual(readQueryState("?url=https%3A%2F%2Fa.test%2Fone&parent=https%3A%2F%2Fa.test%2Ftwo&searchFrom=2026-05-22&searchTo=2026-05-24"), {
    url: "https://a.test/one",
    parent: "https://a.test/two",
    searchFrom: "2026-05-22",
    searchTo: "2026-05-24",
    playerFirstName: "",
    playerLastName: "",
    playerCountry: ""
  });
});

test("createAppUrl adds and removes query params cleanly", () => {
  const baseHref = "https://app.test/index.html?stale=1";

  assert.equal(
    createAppUrl(baseHref, { url: "https://chess-results.com/player", parent: "https://chess-results.com/event" }),
    "https://app.test/index.html?stale=1&url=https%3A%2F%2Fchess-results.com%2Fplayer&parent=https%3A%2F%2Fchess-results.com%2Fevent"
  );

  assert.equal(
    createAppUrl(baseHref, { searchFrom: "2026-05-22", searchTo: "2026-05-24" }),
    "https://app.test/index.html?stale=1&searchFrom=2026-05-22&searchTo=2026-05-24"
  );

  assert.equal(createAppUrl(baseHref, { url: "", parent: "" }), "https://app.test/index.html?stale=1");
});

test("createAppUrl strips legacy searchCountry from base URL", () => {
  const baseHref = "https://app.test/index.html?searchCountry=LAT";
  assert.equal(
    createAppUrl(baseHref, { searchFrom: "2026-05-22" }),
    "https://app.test/index.html?searchFrom=2026-05-22"
  );
});

test("buildInternalPageUrl delegates to app URL construction", () => {
  assert.equal(
    buildInternalPageUrl("https://app.test/index.html", "https://chess-results.com/tnr1.aspx?art=9", "https://chess-results.com/tnr1.aspx?art=1"),
    "https://app.test/index.html?url=https%3A%2F%2Fchess-results.com%2Ftnr1.aspx%3Fart%3D9&parent=https%3A%2F%2Fchess-results.com%2Ftnr1.aspx%3Fart%3D1"
  );
});

test("normalizeSupportedUrl upgrades overview links from art=0 to art=1 and forces lan=1", () => {
  assert.equal(
    normalizeSupportedUrl("https://s2.chess-results.com/tnr1374860.aspx?lan=2&art=0&turdet=YES&flag=30&SNode=S0"),
    "https://s2.chess-results.com/tnr1374860.aspx?lan=1&art=1&turdet=YES&flag=30&SNode=S0"
  );
  assert.equal(
    normalizeSupportedUrl("https://s2.chess-results.com/tnr1374860.aspx?art=9&snr=5"),
    "https://s2.chess-results.com/tnr1374860.aspx?art=9&snr=5&lan=1"
  );
});

test("inferTournamentUrlFromPlayerUrl builds the tournament ranking URL without history state", () => {
  assert.equal(
    inferTournamentUrlFromPlayerUrl(
      "https://s3.chess-results.com/tnr1359649.aspx?lan=1&art=9&fed=LAT&turdet=YES&flag=30&snr=61&SNode=S0&_echr_ts=123"
    ),
    "https://s3.chess-results.com/tnr1359649.aspx?lan=1&art=1&fed=LAT&turdet=YES&flag=30&SNode=S0"
  );
  assert.equal(inferTournamentUrlFromPlayerUrl("https://s3.chess-results.com/tnr1359649.aspx?lan=1&art=1"), "");
});

test("appendCacheBustParam adds a timestamp without mutating invalid inputs", () => {
  assert.equal(
    appendCacheBustParam("https://chess-results.com/tnr1.aspx?art=1&lan=1", 1234567890),
    "https://chess-results.com/tnr1.aspx?art=1&lan=1&_echr_ts=1234567890"
  );
  assert.equal(appendCacheBustParam("not-a-url", 1234567890), "not-a-url");
  assert.equal(
    appendCacheBustParam("https://chess-results.com/tnr1.aspx?art=1&lan=1"),
    "https://chess-results.com/tnr1.aspx?art=1&lan=1"
  );
});

test("PROXY_LOADER.buildUrl adds the cache-busted source url to the Cloudflare Worker", () => {
  assert.equal(
    PROXY_LOADER.buildUrl("https://chess-results.com/tnr1.aspx?art=1&lan=1", 1234567890),
    "https://easy-chess-results-proxy.alexzavalny.workers.dev/fetch?url=https%3A%2F%2Fchess-results.com%2Ftnr1.aspx%3Fart%3D1%26lan%3D1%26_echr_ts%3D1234567890"
  );
});

test("PROXY_LOADER.buildTournamentSearchUrl points to the Worker search endpoint", () => {
  assert.equal(
    PROXY_LOADER.buildTournamentSearchUrl(),
    "https://easy-chess-results-proxy.alexzavalny.workers.dev/search-tournaments"
  );
});

test("PROXY_LOADER.parseResponse returns proxy text", async () => {
  const response = {
    text: async () => "Title: ok"
  };

  assert.equal(await PROXY_LOADER.parseResponse(response), "Title: ok");
});

test("writeQueryState uses requested history mode", () => {
  const calls = [];
  const historyObject = {
    pushState: (...args) => calls.push(["push", ...args]),
    replaceState: (...args) => calls.push(["replace", ...args])
  };

  writeQueryState(historyObject, "https://app.test/index.html", { url: "https://a.test" }, "push");
  writeQueryState(historyObject, "https://app.test/index.html", { url: "", parent: "" }, "replace");

  assert.equal(calls[0][0], "push");
  assert.equal(calls[0][3], "https://app.test/index.html?url=https%3A%2F%2Fa.test");
  assert.equal(calls[1][0], "replace");
  assert.equal(calls[1][3], "https://app.test/index.html");
});

test("chip escapes label and value", () => {
  assert.equal(
    chip("<Label>", '"quoted" & value'),
    '<span class="chip"><span>&lt;Label&gt;: &quot;quoted&quot; &amp; value</span></span>'
  );
  assert.equal(
    chip("FIDE +/-", "-28,4", { direction: "down" }),
    '<span class="chip chip-down"><span class="chip-indicator" aria-hidden="true">▼</span><span>FIDE +/-: -28,4</span></span>'
  );
  assert.equal(chip("Empty", ""), "");
});

test("detectTrendDirection understands chess rating deltas", () => {
  assert.equal(detectTrendDirection("-28,4"), "down");
  assert.equal(detectTrendDirection("+12,1"), "up");
  assert.equal(detectTrendDirection("0"), "");
});

test("escapeHtml escapes all reserved characters used by rendering", () => {
  assert.equal(escapeHtml(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
});

test("highlightPlayerName prepends a star for matching names", () => {
  assert.equal(highlightPlayerName("Zavalnijs, Grigorijs"), "⭐ Zavalnijs, Grigorijs");
  assert.equal(highlightPlayerName("Vanaga, Patricija"), "Vanaga, Patricija");
});

test("prependBookmarkMarker prepends bookmark once", () => {
  assert.equal(prependBookmarkMarker("Alice", true), "🔖 Alice");
  assert.equal(prependBookmarkMarker("🔖 Alice", true), "🔖 Alice");
  assert.equal(prependBookmarkMarker("Alice", false), "Alice");
});

test("cleanHeaderLabel fills unnamed title column", () => {
  assert.equal(cleanHeaderLabel("", 3), "Title");
  assert.equal(cleanHeaderLabel("", 1, { textContent: "MK" }), "Title");
  assert.equal(cleanHeaderLabel("", 0), "Col 1");
});

test("shouldKeepTournamentColumn filters known noise columns", () => {
  assert.equal(shouldKeepTournamentColumn("FED"), false);
  assert.equal(shouldKeepTournamentColumn("TB2"), false);
  assert.equal(shouldKeepTournamentColumn("Name"), true);
  assert.equal(shouldKeepTournamentColumn("Title"), true);
});

test("parseTournamentColumns keeps visible columns and aligns them", () => {
  const headerCells = [
    { textContent: "Rk.", className: "CRc" },
    { textContent: "Name", className: "CR" },
    { textContent: "SNo", className: "CRc" },
    { textContent: "", className: "CR" },
    { textContent: "Pts.", className: "CRc" },
    { textContent: "Rtg", className: "CRr" },
    { textContent: "FED", className: "CR" }
  ];
  const sampleRowCells = [
    { textContent: "1", querySelector: () => null },
    { textContent: "Alice", querySelector: () => null },
    { textContent: "", querySelector: () => null },
    { textContent: "II", querySelector: () => null },
    { textContent: "3.5", querySelector: () => null },
    { textContent: "1500", querySelector: () => null },
    { textContent: "LAT", querySelector: () => null }
  ];

  const parsed = parseTournamentColumns(headerCells, sampleRowCells);

  assert.deepEqual(parsed.keptIndexes, [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(
    parsed.columns.map((column) => ({ label: column.label, align: column.align })),
    [
      { label: "Rk.", align: "center" },
      { label: "Name", align: "" },
      { label: "SNo", align: "center" },
      { label: "Title", align: "" },
      { label: "Pts.", align: "center" },
      { label: "Rtg", align: "right" }
    ]
  );
});

test("parseTournamentColumns drops blank flag columns but keeps blank title columns", () => {
  const headerCells = [
    { textContent: "No.", className: "CRc" },
    { textContent: "", className: "CR" },
    { textContent: "", className: "CR" },
    { textContent: "Name", className: "CR" }
  ];
  const sampleRowCells = [
    { textContent: "1", querySelector: () => null },
    { textContent: "", querySelector: (selector) => (selector === 'div[class*="tn_"]' ? {} : null) },
    { textContent: "II", querySelector: () => null },
    { textContent: "Player", querySelector: () => null }
  ];

  const parsed = parseTournamentColumns(headerCells, sampleRowCells);

  assert.deepEqual(parsed.keptIndexes, [0, 2, 3]);
  assert.deepEqual(parsed.columns.map((column) => column.label), ["No.", "Title", "Name"]);
});

test("parseTournamentRoundLinks keeps only ranking-after round links", () => {
  const rankingContainer = {
    textContent: "Ranking list after Rd.1 Rd.2 Rd.3",
    parentElement: null
  };
  const pairingsContainer = {
    textContent: "Board Pairings Rd.1 Rd.2 Rd.3",
    parentElement: null
  };
  const makeAnchor = (text, href, parentElement) => ({
    textContent: text,
    getAttribute: (name) => (name === "href" ? href : null),
    parentElement
  });
  const doc = {
    querySelectorAll: (selector) =>
      selector === "a"
        ? [
            makeAnchor("Rd.1", "/tnr1.aspx?art=1&rd=1", rankingContainer),
            makeAnchor("Rd.2", "/tnr1.aspx?art=1&rd=2", rankingContainer),
            makeAnchor("Rd.1", "/tnr1.aspx?art=2&rd=1", pairingsContainer)
          ]
        : []
  };

  assert.deepEqual(parseTournamentRoundLinks(doc, "https://chess-results.com/tnr1.aspx?lan=1"), [
    { label: "Rd.1", href: "https://chess-results.com/tnr1.aspx?art=1&rd=1" },
    { label: "Rd.2", href: "https://chess-results.com/tnr1.aspx?art=1&rd=2" }
  ]);
});

test("findColumnIndex returns matching column index", () => {
  assert.equal(findColumnIndex([{ label: "Rk." }, { label: "Typ" }, { label: "Name" }], "Typ"), 1);
  assert.equal(findColumnIndex([{ label: "Rk." }, { label: "Name" }], "Typ"), -1);
});

test("collectUniqueColumnValues returns distinct non-empty values in row order", () => {
  const rows = [
    { cells: [{ text: "1" }, { text: "U10" }] },
    { cells: [{ text: "2" }, { text: "U08" }] },
    { cells: [{ text: "3" }, { text: "U10" }] },
    { cells: [{ text: "4" }, { text: " " }] }
  ];

  assert.deepEqual(collectUniqueColumnValues(rows, 1), ["U10", "U08"]);
  assert.deepEqual(collectUniqueColumnValues(rows, -1), []);
});

test("filterRowsByColumnValue keeps only rows with matching cell text", () => {
  const rows = [
    { cells: [{ text: "1" }, { text: "U10" }] },
    { cells: [{ text: "2" }, { text: "U08" }] },
    { cells: [{ text: "3" }, { text: "U10" }] }
  ];

  assert.deepEqual(
    filterRowsByColumnValue(rows, 1, "U10").map((row) => row.cells[0].text),
    ["1", "3"]
  );
  assert.equal(filterRowsByColumnValue(rows, 1, "").length, 3);
  assert.equal(filterRowsByColumnValue(rows, -1, "U10").length, 3);
});

test("isTournamentRankingDialog accepts 'Rank after Round' tournament tables", () => {
  const dialog = {
    querySelector: (selector) => {
      if (selector === "table.CRs1") {
        return {
          querySelectorAll: (innerSelector) =>
            innerSelector === "tr th"
              ? [{ textContent: "Rk." }, { textContent: "Name" }, { textContent: "Pts." }]
              : []
        };
      }

      if (selector === "h2") {
        return { textContent: "Rank after Round 0" };
      }

      return null;
    }
  };

  assert.equal(isTournamentRankingDialog(dialog), true);
});

test("isTournamentRankingDialog accepts 'Starting rank' tournament tables", () => {
  const dialog = {
    querySelector: (selector) => {
      if (selector === "table.CRs1") {
        return {
          querySelectorAll: (innerSelector) =>
            innerSelector === "tr th"
              ? [{ textContent: "No." }, { textContent: "Name" }, { textContent: "Rtg" }]
              : []
        };
      }

      if (selector === "h2") {
        return { textContent: "Starting rank" };
      }

      return null;
    }
  };

  assert.equal(isTournamentRankingDialog(dialog), true);
});

test("attachPlayerNavigation adds back links to player rows only when parent exists", () => {
  const view = {
    kind: "player",
    backUrl: "",
    rows: [
      {
        cells: [{ text: "A", href: "https://chess-results.com/player" }],
        mobile: { title: "Player", titleHref: "https://chess-results.com/player", details: [] }
      }
    ]
  };

  const updated = attachPlayerNavigation(view, "https://chess-results.com/tournament");

  assert.equal(updated.backUrl, "https://chess-results.com/tournament");
  assert.equal(updated.rows[0].cells[0].parentUrl, "https://chess-results.com/tournament");
  assert.equal(updated.rows[0].mobile.parentUrl, "https://chess-results.com/tournament");
});

test("attachPlayerNavigation uses the parsed player backUrl when no history parent exists", () => {
  const view = {
    kind: "player",
    backUrl: "https://chess-results.com/tnr1.aspx?art=1",
    rows: [
      {
        cells: [{ text: "A", href: "https://chess-results.com/player" }],
        mobile: { title: "Player", titleHref: "https://chess-results.com/player", details: [] }
      }
    ]
  };

  const updated = attachPlayerNavigation(view, "");

  assert.equal(updated.backUrl, "https://chess-results.com/tnr1.aspx?art=1");
  assert.equal(updated.rows[0].cells[0].parentUrl, "https://chess-results.com/tnr1.aspx?art=1");
  assert.equal(updated.rows[0].mobile.parentUrl, "https://chess-results.com/tnr1.aspx?art=1");
});

test("renderColorMarker covers white, black, and empty cases", () => {
  assert.match(renderColorMarker("white"), /aria-label="White"/);
  assert.match(renderColorMarker("black"), /aria-label="Black"/);
  assert.match(renderColorMarker(""), /aria-hidden="true"/);
});

test("renderCellContent builds internal links and preserves color-dot HTML", () => {
  const html = renderCellContent(
    {
      href: "https://chess-results.com/tnr1.aspx?art=9",
      raw: "white",
      parentUrl: "https://chess-results.com/tnr1.aspx?art=1"
    },
    "https://app.test/index.html"
  );

  assert.match(html, /https:\/\/app\.test\/index\.html\?url=/);
  assert.match(html, /aria-label="White"/);
});

test("renderMobileRows links title and escapes text content", () => {
  const html = renderMobileRows(
    [
      {
        mobile: {
          topLeft: "Rank 1",
          topRight: '2 <pts>',
          topRightColor: "black",
          title: "⭐ Zavalnijs, Grigorijs",
          titleHref: "https://chess-results.com/player",
          parentUrl: "https://chess-results.com/tournament",
          details: ["1500 · Club", "Title II"]
        }
      }
    ],
    "https://app.test/index.html"
  );

  assert.match(html, /⭐ Zavalnijs, Grigorijs/);
  assert.match(html, /2 &lt;pts&gt;/);
  assert.match(html, /aria-label="Black"/);
  assert.match(html, /parent=https%3A%2F%2Fchess-results.com%2Ftournament/);
});

test("parsePlayerPage keeps player header info when opponents table is missing", () => {
  const makeCell = (text) => ({ textContent: text });
  const makeRow = (label, value) => ({
    querySelectorAll: (selector) => (selector === "td" ? [makeCell(label), makeCell(value)] : [])
  });
  const infoTable = {
    querySelectorAll: (selector) =>
      selector === "tr"
        ? [
            makeRow("Name", "Test Player"),
            makeRow("Title", "FM"),
            makeRow("Rank", "12"),
            makeRow("Points", "0"),
            makeRow("FIDE rtg +/-", "-28,4"),
            makeRow("Federation", "LAT"),
            makeRow("Club/City", "Riga"),
            makeRow("Fide-ID", "12345678")
          ]
        : []
  };
  const playerDialog = {
    querySelector: (selector) => (selector === "h2" ? { textContent: "Player info" } : null),
    querySelectorAll: (selector) => (selector === "table" ? [infoTable] : [])
  };
  const doc = {
    querySelectorAll: (selector) => (selector === ".defaultDialog" ? [playerDialog] : [])
  };

  const parsed = parsePlayerPage(doc, "https://chess-results.com/tnr1.aspx?art=9&snr=21");

  assert.equal(parsed.kind, "player");
  assert.equal(parsed.title, "Test Player");
  assert.equal(parsed.rows.length, 0);
  assert.equal(parsed.backUrl, "https://chess-results.com/tnr1.aspx?art=1");
  assert.deepEqual(parsed.columns.map((column) => column.label), ["Rd", "Bo", "Title", "Name", "Rtg", "Club", "Pts", "Clr", "Res"]);
  assert.equal(parsed.fideId, "12345678");
  assert.equal(parsed.fideUrl, "https://ratings.fide.com/profile/12345678");
  assert.deepEqual(
    parsed.chips.map((entry) => `${entry.label}:${entry.value}`),
    ["Title:FM", "Rank:12", "Points:0", "FIDE +/-:-28,4", "FED:LAT", "Club:Riga"]
  );
  assert.equal(parsed.chips.find((entry) => entry.label === "FIDE +/-")?.direction, "down");
});

test("parsePlayerPage supports opponent rows when club column is absent", () => {
  const makeCell = (text, options = {}) => ({
    textContent: text,
    className: options.className || "",
    querySelector: (selector) => {
      if (selector === "a") {
        return options.anchor || null;
      }
      if (selector === ".FarbewT") {
        return options.color === "white" ? {} : null;
      }
      if (selector === ".FarbesT") {
        return options.color === "black" ? {} : null;
      }
      return null;
    }
  });
  const makeRow = (cells, isHeader = false) => ({
    children: cells,
    querySelector: (selector) => (selector === "th" && isHeader ? {} : null)
  });
  const makeInfoRow = (label, value) => ({
    querySelectorAll: (selector) => (selector === "td" ? [makeCell(label), makeCell(value)] : [])
  });

  const infoTable = {
    querySelectorAll: (selector) =>
      selector === "tr"
        ? [makeInfoRow("Name", "Haritonovs, Daniels"), makeInfoRow("Title", "II"), makeInfoRow("Points", "2")]
        : []
  };
  const opponentsTable = {
    querySelectorAll: (selector) =>
      selector === "tr"
        ? [
            makeRow([], true),
            makeRow([
              makeCell("1", { className: "CRc" }),
              makeCell("22", { className: "CRc" }),
              makeCell("60", { className: "CRc" }),
              makeCell("", { className: "CR" }),
              makeCell("Cerkovskis, Alekss", {
                className: "CR",
                anchor: { getAttribute: (name) => (name === "href" ? "/tnr1375437.aspx?lan=1&art=9&fed=LAT&snr=60" : null) }
              }),
              makeCell("0", { className: "CRr" }),
              makeCell("LAT", { className: "CR" }),
              makeCell("0", { className: "CRc" }),
              makeCell("1", { className: "CR", color: "white" })
            ])
          ]
        : []
  };
  const playerDialog = {
    querySelector: (selector) => (selector === "h2" ? { textContent: "Player info" } : null),
    querySelectorAll: (selector) => (selector === "table" ? [infoTable, opponentsTable] : [])
  };
  const doc = {
    querySelectorAll: (selector) => (selector === ".defaultDialog" ? [playerDialog] : [])
  };

  const parsed = parsePlayerPage(doc, "https://s2.chess-results.com/tnr1375437.aspx?lan=1&art=9&fed=LAT&snr=22&SNode=S0");

  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].cells[3].text, "Cerkovskis, Alekss");
  assert.equal(parsed.rows[0].cells[5].text, "");
  assert.equal(parsed.rows[0].cells[6].text, "0");
  assert.equal(parsed.rows[0].cells[7].raw, "white");
  assert.equal(parsed.rows[0].cells[8].text, "1");
  assert.equal(parsed.rows[0].mobile.details[1], "Club -");
  assert.equal(
    parsed.rows[0].cells[3].href,
    "https://s2.chess-results.com/tnr1375437.aspx?lan=1&art=9&fed=LAT&snr=60"
  );
});

test("index cache-busts scripts for tournament search deployment", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

  assert.match(html, /script\.js\?v=20260617-story-3/);
  assert.match(html, /lib\/chess-results\.js\?v=20260616-search-worker/);
  assert.match(html, /styles\.css\?v=20260617-story-3/);
  assert.match(html, /<meta name="color-scheme" content="light dark" \/>/);
  assert.match(html, /<meta name="theme-color" content="#121816" media="\(prefers-color-scheme: dark\)" \/>/);
  assert.match(html, /<form id="search-form"[^>]*onsubmit="return false"/);
  assert.doesNotMatch(html, /id="search-country"/);
  assert.match(html, /<form id="player-search-form"[^>]*onsubmit="return false"/);
  assert.match(html, /id="player-country"[^>]*value="LAT"/);
});

test("buildTournamentSearchPayload submits country and end dates in browser date format", () => {
  const payload = buildTournamentSearchPayload({ country: "LAT", dateFrom: "2026-05-01", dateTo: "2026-06-30" });

  assert.equal(payload.get("ctl00$P1$combo_land"), "LAT");
  assert.equal(payload.get("ctl00$P1$txt_von_tag"), "2026-05-01");
  assert.equal(payload.get("ctl00$P1$txt_bis_tag"), "2026-06-30");
  assert.equal(payload.get("ctl00$P1$combo_art"), "5");
  assert.equal(payload.get("ctl00$P1$combo_sort"), "3");
  assert.equal(payload.get("ctl00$P1$cb_suchen"), "Search");
  assert.equal(payload.has("ctl00$P1$cb_download_Excel"), false);
  assert.equal(payload.has("ctl00$P1$txt_bez"), false);
});

test("parseTournamentSearchPage ignores form/layout rows without tournament links", () => {
  const html = String.raw`
    <table class="CRs1">
      <tr><th>Tournament</th><th>End</th></tr>
      <tr><td>Tournament</td><td></td></tr>
      <tr><td>Logged on: Gast Servertime 19.05.2026 20:05:53</td><td></td></tr>
      <tr><td>Logout Login Arabic ARM AZE BIH</td><td></td></tr>
      <tr><td><a href="tnr1416130.aspx?lan=1">Latvijas ātrspēles līgas vasaras sezona 2026 | 1.</a></td><td>24.05.2026</td></tr>
    </table>`;

  const parsed = parseTournamentSearchPage(html, "https://s2.chess-results.com/turniersuche.aspx?lan=1");

  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].mobile.title, "Latvijas ātrspēles līgas vasaras sezona 2026 | 1.");
  assert.equal(parsed.rows[0].mobile.titleHref, "https://s2.chess-results.com/tnr1416130.aspx?lan=1");
});

test("parseTournamentSearchPage picks nested CRs2 result table instead of outer layout table", () => {
  const html = String.raw`
    <table id="datenxx">
      <tr><td><span>Tournament</span></td></tr>
      <tr><td>
        <table class="CRs2">
          <tr><td>No.</td><td>Tournament</td><th>FED</th><th>from</th><th>to</th><td>dbkey</td></tr>
          <tr><td>1</td><td><a href="tnr1406253.aspx?lan=1">Daugava Chess rapid maijs 2026 (24.05.2026)</a></td><td>LAT</td><td>2026/05/24</td><td>2026/05/24</td><td>1406253</td></tr>
        </table>
      </td></tr>
    </table>`;

  const parsed = parseTournamentSearchPage(html, "https://s2.chess-results.com/turniersuche.aspx?lan=1");

  assert.equal(parsed.rows.length, 1);
  assert.deepEqual(parsed.columns.map((column) => column.label), ["No.", "Tournament", "FED", "from", "to", "dbkey"]);
  assert.equal(parsed.rows[0].mobile.topLeft, "DB 1");
  assert.equal(parsed.rows[0].mobile.title, "Daugava Chess rapid maijs 2026 (24.05.2026)");
});

test("parseTournamentSearchPage surfaces time-control on mobile details", () => {
  const html = String.raw`
    <table class="CRs1">
      <tr><th>DB-Key</th><th>Tournament</th><th>Time-control</th><th>Start</th><th>End</th><th>FED</th></tr>
      <tr>
        <td>1416130</td>
        <td><a href="tnr1416130.aspx?lan=1">Latvijas ātrspēles līgas vasaras sezona 2026 | 1.</a></td>
        <td>Rapid</td>
        <td>2026/05/20</td><td>2026/05/20</td><td>LAT</td>
      </tr>
    </table>`;

  const parsed = parseTournamentSearchPage(html, "https://s2.chess-results.com/turniersuche.aspx?lan=1");

  assert.equal(parsed.rows.length, 1);
  assert.ok(parsed.rows[0].mobile.details.some((detail) => /Time-control: Rapid/.test(detail)), `mobile.details should include time control: ${JSON.stringify(parsed.rows[0].mobile.details)}`);
  assert.ok(parsed.rows[0].mobile.details.some((detail) => /Start: 2026\/05\/20/.test(detail)));
  assert.ok(parsed.rows[0].mobile.details.some((detail) => /End: 2026\/05\/20/.test(detail)));
});

test("parseTournamentSearchPage extracts tournament result links and dates", () => {
  const html = String.raw`
    <table class="CRs1">
      <tr><th>DB-Key</th><th>Tournament</th><th>Start</th><th>End</th><th>FED</th></tr>
      <tr>
        <td>1416130</td>
        <td><a href="tnr1416130.aspx?lan=1">Latvijas ātrspēles līgas vasaras sezona 2026 | 1.</a></td>
        <td>2026/05/20</td><td>2026/05/20</td><td>LAT</td>
      </tr>
      <tr>
        <td>1405517</td>
        <td><a href="https://s2.chess-results.com/tnr1405517.aspx?lan=1">Jēkabpils pavasaris</a></td>
        <td>2026/06/01</td><td>2026/06/02</td><td>LAT</td>
      </tr>
    </table>`;

  const parsed = parseTournamentSearchPage(html, "https://s2.chess-results.com/turniersuche.aspx?lan=1");

  assert.equal(parsed.kind, "search");
  assert.equal(parsed.rows.length, 2);
  assert.deepEqual(parsed.columns.map((column) => column.label), ["DB-Key", "Tournament", "Start", "End", "FED"]);
  assert.equal(parsed.rows[0].cells[1].text, "Latvijas ātrspēles līgas vasaras sezona 2026 | 1.");
  assert.equal(parsed.rows[0].cells[1].href, "https://s2.chess-results.com/tnr1416130.aspx?lan=1");
  assert.equal(parsed.rows[0].mobile.titleHref, "https://s2.chess-results.com/tnr1416130.aspx?lan=1");
});


test("buildPlayerSearchPayload searches players by first and last name with LAT default", () => {
  const payload = buildPlayerSearchPayload({ firstName: "Grigorijs", lastName: "Zavalnijs" });

  assert.equal(payload.get("ctl00$P1$txt_vorname"), "Grigorijs");
  assert.equal(payload.get("ctl00$P1$txt_nachname"), "Zavalnijs");
  assert.equal(payload.get("ctl00$P1$txt_FED"), "LAT");
  assert.equal(payload.get("ctl00$P1$combo_Sort"), "0");
  assert.equal(payload.get("ctl00$P1$combo_anzahl_zeilen"), "1");
  assert.equal(payload.get("ctl00$P1$cb_suchen"), "Search");
  assert.equal(payload.has("ctl00$P1$cb_download_Excel"), false);
});

test("parsePlayerSearchPage extracts player and tournament links", () => {
  const html = String.raw`
    <table class="CRs2">
      <tr><th>Name</th><th>ID</th><th>FideID</th><th>Club/City</th><th>FED</th><td>Tournament</td><td>End-Date</td><th>Rk.</th><th>Rd.</th><td>n</td></tr>
      <tr>
        <td><a href="tnr1374860.aspx?lan=1&amp;art=9&amp;snr=35">Zavalnijs, Grigorijs</a></td>
        <td>0</td><td>11653949</td><td>Motivacija/J. Moisejeva</td><td>LAT</td>
        <td><a href="tnr1374860.aspx?lan=1">Šahatons 2026- A</a></td><td>2026/04/11</td><td>42</td><td>7</td><td>43</td>
      </tr>
    </table>`;

  const parsed = parsePlayerSearchPage(html, "https://s2.chess-results.com/SpielerSuche.aspx?lan=1");

  assert.equal(parsed.kind, "player-search");
  assert.equal(parsed.label, "Player search");
  assert.equal(parsed.rows.length, 1);
  assert.deepEqual(parsed.columns.map((column) => column.label), ["Name", "ID", "FideID", "Club/City", "FED", "Tournament", "End-Date", "Rk.", "Rd.", "n"]);
  assert.equal(parsed.rows[0].cells[0].href, "https://s2.chess-results.com/tnr1374860.aspx?lan=1&art=9&snr=35");
  assert.equal(parsed.rows[0].cells[5].href, "https://s2.chess-results.com/tnr1374860.aspx?lan=1");
  assert.equal(parsed.rows[0].mobile.title, "Zavalnijs, Grigorijs");
  assert.equal(parsed.rows[0].mobile.titleHref, "https://s2.chess-results.com/tnr1374860.aspx?lan=1&art=9&snr=35");
});
