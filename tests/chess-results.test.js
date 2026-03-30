const test = require("node:test");
const assert = require("node:assert/strict");

const {
  attachPlayerNavigation,
  buildInternalPageUrl,
  chip,
  cleanHeaderLabel,
  createAppUrl,
  escapeHtml,
  isTournamentRankingDialog,
  normalizeSupportedUrl,
  parseTournamentColumns,
  readQueryState,
  renderCellContent,
  renderColorMarker,
  renderMobileRows,
  shouldKeepTournamentColumn,
  writeQueryState
} = require("../lib/chess-results.js");

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
  assert.equal(chip("<Label>", '"quoted" & value'), "<span>&lt;Label&gt;: &quot;quoted&quot; &amp; value</span>");
  assert.equal(chip("Empty", ""), "");
});

test("escapeHtml escapes all reserved characters used by rendering", () => {
  assert.equal(escapeHtml(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
});

test("cleanHeaderLabel fills unnamed title column", () => {
  assert.equal(cleanHeaderLabel("", 3), "Title");
  assert.equal(cleanHeaderLabel("", 0), "Col 1");
});

test("shouldKeepTournamentColumn filters known noise columns", () => {
  assert.equal(shouldKeepTournamentColumn("FED", 6), false);
  assert.equal(shouldKeepTournamentColumn("TB2", 7), false);
  assert.equal(shouldKeepTournamentColumn("Name", 4), true);
  assert.equal(shouldKeepTournamentColumn("Anything", 2), false);
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

  const parsed = parseTournamentColumns(headerCells);

  assert.deepEqual(parsed.keptIndexes, [0, 1, 3, 4, 5]);
  assert.deepEqual(
    parsed.columns.map((column) => ({ label: column.label, align: column.align })),
    [
      { label: "Rk.", align: "center" },
      { label: "Name", align: "" },
      { label: "Title", align: "" },
      { label: "Pts.", align: "center" },
      { label: "Rtg", align: "right" }
    ]
  );
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
          title: "Alice & Bob",
          titleHref: "https://chess-results.com/player",
          parentUrl: "https://chess-results.com/tournament",
          details: ["1500 · Club", "Title II"]
        }
      }
    ],
    "https://app.test/index.html"
  );

  assert.match(html, /Alice &amp; Bob/);
  assert.match(html, /2 &lt;pts&gt;/);
  assert.match(html, /aria-label="Black"/);
  assert.match(html, /parent=https%3A%2F%2Fchess-results.com%2Ftournament/);
});
