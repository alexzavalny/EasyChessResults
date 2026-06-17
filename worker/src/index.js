const DEFAULT_ALLOWED_ORIGIN = "*";
const DEFAULT_CACHE_SECONDS = 60;
const DEFAULT_UPSTREAM_TIMEOUT_MS = 10000;
const TOURNAMENT_SEARCH_URL = "https://s2.chess-results.com/turniersuche.aspx?lan=1";

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

function getAllowedOrigin(request, env = {}) {
  const configuredOrigin = env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
  if (configuredOrigin === "*") {
    return "*";
  }

  const requestOrigin = request.headers.get("Origin") || "";
  const allowedOrigins = configuredOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0] || DEFAULT_ALLOWED_ORIGIN;
}

function withCors(request, env, headers = {}) {
  return {
    ...CORS_HEADERS,
    "Access-Control-Allow-Origin": getAllowedOrigin(request, env),
    Vary: "Origin",
    ...headers
  };
}

function textResponse(request, env, body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: withCors(request, env, {
      "Content-Type": "text/plain; charset=utf-8",
      ...headers
    })
  });
}

function isAllowedChessResultsHost(hostname) {
  return hostname === "chess-results.com" || hostname.endsWith(".chess-results.com");
}

function normalizeTargetUrl(rawUrl) {
  if (!rawUrl) {
    throw new Error("Missing url query parameter.");
  }

  const target = new URL(rawUrl);
  if (!/^https?:$/.test(target.protocol)) {
    throw new Error("Only http and https targets are allowed.");
  }

  if (!isAllowedChessResultsHost(target.hostname.toLowerCase())) {
    throw new Error("Only chess-results.com hosts are allowed.");
  }

  if (!target.pathname.toLowerCase().endsWith(".aspx")) {
    throw new Error("Only Chess-Results .aspx pages are allowed.");
  }

  return target;
}

function buildHeaders(request, env = {}) {
  return {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": request.headers.get("Accept-Language") || "en-US,en;q=0.9",
    "User-Agent": env.UPSTREAM_USER_AGENT || "EasyChessResultsWorker/1.0 (+https://github.com/alexzavalny/EasyChessResults)"
  };
}

function buildUpstreamRequest(target, request, env = {}) {
  const controller = new AbortController();
  const timeoutMs = Number(env.UPSTREAM_TIMEOUT_MS || DEFAULT_UPSTREAM_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort("Upstream request timed out."), timeoutMs);

  const upstreamRequest = new Request(target.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: buildHeaders(request, env),
    redirect: "follow",
    cf: {
      cacheEverything: true,
      cacheTtl: Number(env.CACHE_SECONDS || DEFAULT_CACHE_SECONDS)
    },
    signal: controller.signal
  });

  return { upstreamRequest, timeout };
}

function extractHiddenFields(html = "") {
  const fields = new URLSearchParams();
  const inputPattern = /<input\b[^>]*>/gi;
  const namePattern = /\bname\s*=\s*(["'])(.*?)\1/i;
  const valuePattern = /\bvalue\s*=\s*(["'])(.*?)\1/i;
  const typePattern = /\btype\s*=\s*(["'])(.*?)\1/i;
  for (const [inputTag] of String(html).matchAll(inputPattern)) {
    const type = inputTag.match(typePattern)?.[2]?.toLowerCase() || "text";
    if (type !== "hidden") {
      continue;
    }
    const name = inputTag.match(namePattern)?.[2];
    if (!name) {
      continue;
    }
    fields.set(name, decodeHtmlAttribute(inputTag.match(valuePattern)?.[2] || ""));
  }
  return fields;
}

function decodeHtmlAttribute(value = "") {
  return String(value)
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function buildTournamentSearchPayload({ country = "LAT", dateFrom = "", dateTo = "", hiddenFields = new URLSearchParams() } = {}) {
  const payload = new URLSearchParams(hiddenFields);
  payload.set("ctl00$P1$combo_art", "5");
  payload.set("ctl00$P1$combo_sort", "3");
  payload.set("ctl00$P1$combo_land", String(country || "LAT").trim().toUpperCase() || "LAT");
  payload.set("ctl00$P1$combo_bedenkzeit", "0");
  payload.set("ctl00$P1$combo_anzahl_zeilen", "0");
  if (dateFrom) {
    payload.set("ctl00$P1$txt_von_tag", String(dateFrom).trim());
  }
  if (dateTo) {
    payload.set("ctl00$P1$txt_bis_tag", String(dateTo).trim());
  }
  payload.set("ctl00$P1$cb_suchen", "Search");
  payload.delete("ctl00$P1$cb_download_Excel");
  return payload;
}

function collectSetCookie(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie().join("; ");
  }
  const singleHeader = headers.get("Set-Cookie") || "";
  return singleHeader
    .split(/,(?=\s*[^;,=]+=[^;,]+)/)
    .map((cookie) => cookie.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

async function readJsonRequest(request) {
  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  const form = new URLSearchParams(await request.text());
  return Object.fromEntries(form.entries());
}

async function tournamentSearch(request, env = {}) {
  if (request.method !== "POST") {
    return textResponse(request, env, "Method not allowed.", 405, { Allow: "POST, OPTIONS" });
  }

  let params;
  try {
    params = await readJsonRequest(request);
  } catch (error) {
    return textResponse(request, env, `Invalid search request: ${error.message}`, 400);
  }

  const controller = new AbortController();
  const timeoutMs = Number(env.UPSTREAM_TIMEOUT_MS || DEFAULT_UPSTREAM_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort("Upstream request timed out."), timeoutMs);

  try {
    const getResponse = await fetch(TOURNAMENT_SEARCH_URL, {
      method: "GET",
      headers: buildHeaders(request, env),
      redirect: "follow",
      signal: controller.signal
    });
    if (!getResponse.ok) {
      return textResponse(request, env, `Could not open tournament search with status ${getResponse.status}.`, 502, {
        "X-Upstream-Status": String(getResponse.status)
      });
    }

    const initialHtml = await getResponse.text();
    const cookies = collectSetCookie(getResponse.headers);
    const payload = buildTournamentSearchPayload({
      country: params.country || "LAT",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      hiddenFields: extractHiddenFields(initialHtml)
    });

    const postHeaders = {
      ...buildHeaders(request, env),
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://s2.chess-results.com",
      "Referer": TOURNAMENT_SEARCH_URL
    };
    if (cookies) {
      postHeaders.Cookie = cookies;
    }

    const postResponse = await fetch(TOURNAMENT_SEARCH_URL, {
      method: "POST",
      headers: postHeaders,
      body: payload.toString(),
      redirect: "follow",
      signal: controller.signal
    });

    const responseHeaders = withCors(request, env, {
      "Cache-Control": "no-store",
      "Content-Type": postResponse.headers.get("Content-Type") || "text/html; charset=utf-8",
      "X-Easy-Chess-Results-Proxy": "cloudflare-worker",
      "X-Easy-Chess-Results-Search": "tournament",
      "X-Upstream-Status": String(postResponse.status)
    });

    return new Response(postResponse.body, {
      status: postResponse.status,
      statusText: postResponse.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    const message = error?.name === "AbortError" ? "Upstream request timed out." : `Tournament search failed: ${error.message}`;
    return textResponse(request, env, message, 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function proxyFetchPage(request, env = {}) {
  if (!["GET", "HEAD"].includes(request.method)) {
    return textResponse(request, env, "Method not allowed.", 405, { Allow: "GET, HEAD, OPTIONS" });
  }

  let target;
  try {
    const requestUrl = new URL(request.url);
    target = normalizeTargetUrl(requestUrl.searchParams.get("url"));
  } catch (error) {
    return textResponse(request, env, error.message, 400);
  }

  const { upstreamRequest, timeout } = buildUpstreamRequest(target, request, env);

  try {
    const upstreamResponse = await fetch(upstreamRequest);
    const cacheSeconds = Number(env.CACHE_SECONDS || DEFAULT_CACHE_SECONDS);
    const responseHeaders = withCors(request, env, {
      "Cache-Control": `public, max-age=${cacheSeconds}`,
      "Content-Type": upstreamResponse.headers.get("Content-Type") || "text/html; charset=utf-8",
      "X-Easy-Chess-Results-Proxy": "cloudflare-worker",
      "X-Upstream-Status": String(upstreamResponse.status)
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    const message = error?.name === "AbortError" ? "Upstream request timed out." : `Upstream request failed: ${error.message}`;
    return textResponse(request, env, message, 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function proxyChessResults(request, env = {}) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: withCors(request, env) });
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.pathname.endsWith("/search-tournaments")) {
    return tournamentSearch(request, env);
  }

  return proxyFetchPage(request, env);
}

export default {
  fetch: proxyChessResults
};

export {
  buildTournamentSearchPayload,
  extractHiddenFields,
  getAllowedOrigin,
  isAllowedChessResultsHost,
  normalizeTargetUrl,
  proxyChessResults,
  withCors
};
