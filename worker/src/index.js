const DEFAULT_ALLOWED_ORIGIN = "*";
const DEFAULT_CACHE_SECONDS = 60;
const DEFAULT_UPSTREAM_TIMEOUT_MS = 10000;

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
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

function buildUpstreamRequest(target, request, env = {}) {
  const controller = new AbortController();
  const timeoutMs = Number(env.UPSTREAM_TIMEOUT_MS || DEFAULT_UPSTREAM_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort("Upstream request timed out."), timeoutMs);

  const upstreamRequest = new Request(target.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": request.headers.get("Accept-Language") || "en-US,en;q=0.9",
      "User-Agent": env.UPSTREAM_USER_AGENT || "EasyChessResultsWorker/1.0 (+https://github.com/alexzavalny/EasyChessResults)"
    },
    redirect: "follow",
    cf: {
      cacheEverything: true,
      cacheTtl: Number(env.CACHE_SECONDS || DEFAULT_CACHE_SECONDS)
    },
    signal: controller.signal
  });

  return { upstreamRequest, timeout };
}

async function proxyChessResults(request, env = {}) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: withCors(request, env) });
  }

  if (! ["GET", "HEAD"].includes(request.method)) {
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

export default {
  fetch: proxyChessResults
};

export {
  getAllowedOrigin,
  isAllowedChessResultsHost,
  normalizeTargetUrl,
  proxyChessResults,
  withCors
};
