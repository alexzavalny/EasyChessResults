import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllowedOrigin,
  isAllowedChessResultsHost,
  normalizeTargetUrl,
  proxyChessResults
} from "../worker/src/index.js";

test("isAllowedChessResultsHost allows chess-results root and subdomains only", () => {
  assert.equal(isAllowedChessResultsHost("chess-results.com"), true);
  assert.equal(isAllowedChessResultsHost("s3.chess-results.com"), true);
  assert.equal(isAllowedChessResultsHost("evilchess-results.com"), false);
  assert.equal(isAllowedChessResultsHost("chess-results.com.evil.test"), false);
});

test("normalizeTargetUrl accepts Chess-Results .aspx pages", () => {
  const target = normalizeTargetUrl("https://s3.chess-results.com/tnr1359649.aspx?lan=1&art=1");
  assert.equal(target.hostname, "s3.chess-results.com");
  assert.equal(target.searchParams.get("art"), "1");
});

test("normalizeTargetUrl rejects unsafe targets", () => {
  assert.throws(() => normalizeTargetUrl(""), /Missing url/);
  assert.throws(() => normalizeTargetUrl("ftp://chess-results.com/tnr1.aspx"), /Only http and https/);
  assert.throws(() => normalizeTargetUrl("https://example.com/tnr1.aspx"), /Only chess-results.com/);
  assert.throws(() => normalizeTargetUrl("https://chess-results.com/not-aspx"), /Only Chess-Results \.aspx/);
});

test("getAllowedOrigin supports wildcard and allowlisted origins", () => {
  const request = new Request("https://worker.test/fetch", {
    headers: { Origin: "https://alexzavalny.github.io" }
  });

  assert.equal(getAllowedOrigin(request, {}), "*");
  assert.equal(getAllowedOrigin(request, { ALLOWED_ORIGIN: "https://alexzavalny.github.io" }), "https://alexzavalny.github.io");
  assert.equal(getAllowedOrigin(request, { ALLOWED_ORIGIN: "https://a.test, https://alexzavalny.github.io" }), "https://alexzavalny.github.io");
  assert.equal(getAllowedOrigin(request, { ALLOWED_ORIGIN: "https://a.test" }), "https://a.test");
});

test("proxyChessResults handles preflight and validation errors", async () => {
  const preflight = await proxyChessResults(new Request("https://worker.test/fetch", { method: "OPTIONS" }), {});
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), "*");

  const missing = await proxyChessResults(new Request("https://worker.test/fetch"), {});
  assert.equal(missing.status, 400);
  assert.match(await missing.text(), /Missing url/);
});
