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
  isTournamentRankingDialog,
  normalizeFideId,
  normalizeSupportedUrl,
  parsePlayerPage,
  parseTournamentColumns,
  parseTournamentRoundLinks,
  prependBookmarkMarker,
  PROXY_LOADER,
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

test("readQueryState returns url and parent from search params", () => {
  assert.deepEqual(readQueryState("?url=https%3A%2F%2Fa.test%2Fone&parent=https%3A%2F%2Fa.test%2Ftwo"), {
    url: "https://a.test/one",
    parent: "https://a.test/two"
  });
});

test("createAppUrl adds and removes query params cleanly", () => {
  const baseHref = "https://app.test/index.html?stale=1";

  assert.equal(
    createAppUrl(baseHref, { url: "https://chess-results.com/player", parent: "https://chess-results.com/event" }),
    "https://app.test/index.html?stale=1&url=https%3A%2F%2Fchess-results.com%2Fplayer&parent=https%3A%2F%2Fchess-results.com%2Fevent"
  );

  assert.equal(createAppUrl(baseHref, { url: "", parent: "" }), "https://app.test/index.html?stale=1");
});

test("buildInternalPageUrl delegates to app URL construction", () => {
  assert.equal(
    buildInternalPageUrl("https://app.test/index.html", "https://chess-results.com/tnr1.aspx?art=9", "https://chess-results.com/tnr1.aspx?art=1"),
    "https://app.test/index.html?url=https%3A%2F%2Fchess-results.com%2Ftnr1.aspx%3Fart%3D9&parent=https%3A%2F%2Fchess-results.com%2Ftnr1.aspx%3Fart%3D1"
  );
});

test("normalizeSupportedUrl upgrades overview links from art=0 to art=1", () => {
  assert.equal(
    normalizeSupportedUrl("https://s2.chess-results.com/tnr1374860.aspx?lan=1&art=0&turdet=YES&flag=30&SNode=S0"),
    "https://s2.chess-results.com/tnr1374860.aspx?lan=1&art=1&turdet=YES&flag=30&SNode=S0"
  );
  assert.equal(
    normalizeSupportedUrl("https://s2.chess-results.com/tnr1374860.aspx?lan=1&art=9&snr=5"),
    "https://s2.chess-results.com/tnr1374860.aspx?lan=1&art=9&snr=5"
  );
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

test("PROXY_LOADER.buildUrl encodes the cache-busted source url", () => {
  assert.equal(
    PROXY_LOADER.buildUrl("https://chess-results.com/tnr1.aspx?art=1&lan=1", 1234567890),
    "https://corsproxy.io/?url=https%3A%2F%2Fchess-results.com%2Ftnr1.aspx%3Fart%3D1%26lan%3D1%26_echr_ts%3D1234567890"
  );
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
