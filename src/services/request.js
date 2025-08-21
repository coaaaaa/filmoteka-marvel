import axios from "axios";

const PROXY = import.meta.env.VITE_PROXY_URL?.trim() || "";

const api = axios.create({
  baseURL: PROXY || undefined,
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    console.error("API ERROR:", status, err?.message);
    return Promise.reject(err);
  }
);

const buildPath = (parts = []) =>
  parts
    .map((p) => String(p).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");

const delay = (ms, { signal } = {}) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const e = new Error("Aborted");
      e.name = "AbortError";
      reject(e);
      return;
    }
    const t = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(t);
        const e = new Error("Aborted");
        e.name = "AbortError";
        reject(e);
      };
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });

const parseRetryAfter = (hdr) => {
  if (!hdr) return null;
  const s = String(hdr).trim();
  if (/^\d+$/.test(s)) return Math.max(0, parseInt(s, 10)) * 1000;
  const when = Date.parse(s);
  if (Number.isFinite(when)) {
    const ms = when - Date.now();
    return ms > 0 ? ms : 0;
  }
  return null;
};

const shouldRetry = (err) => {
  if (axios.isCancel(err)) return false;
  const status = err?.response?.status;
  const code = err?.code;
  const isTimeout = code === "ECONNABORTED";
  const isNetwork = !err?.response && !axios.isCancel(err);
  if (isNetwork || isTimeout) return true;
  return [429, 500, 502, 503, 504].includes(status);
};

async function requestWithRetry(
  config,
  { retries = 3, baseDelay = 300, maxDelay = 5000, signal } = {}
) {
  let attempt = 0;
  for (;;) {
    if (signal?.aborted) {
      const e = new Error("Aborted");
      e.name = "AbortError";
      throw e;
    }
    try {
      const res = await api.request({ ...config, signal });
      return res;
    } catch (err) {
      attempt += 1;
      if (!shouldRetry(err) || attempt > retries) throw err;
      const retryAfterMs = parseRetryAfter(
        err?.response?.headers?.["retry-after"]
      );
      const backoff = Math.min(maxDelay, baseDelay * 2 ** (attempt - 1));
      const jitter = Math.random() * backoff;
      const waitMs = retryAfterMs ?? jitter;
      await delay(waitMs, { signal });
    }
  }
}

export async function getMarvelData(pathParts, params = {}, options = {}) {
  if (!PROXY) {
    const e = new Error(
      "VITE_PROXY_URL nije podešen. Konfiguriši proxy (.env) pa restartuj Vite."
    );
    e.name = "ConfigError";
    throw e;
  }
  const endpoint = buildPath(
    Array.isArray(pathParts) ? pathParts : [pathParts]
  );
  const res = await requestWithRetry(
    { method: "get", url: `/${endpoint}`, params, timeout: options.timeout },
    {
      retries: options.retries ?? 3,
      baseDelay: options.baseDelay ?? 300,
      maxDelay: options.maxDelay ?? 5000,
      signal: options.signal,
    }
  );
  return res.data;
}

export async function getSeries(
  { limit = 20, offset = 0, q = "" } = {},
  options = {}
) {
  const canCache = !q && offset === 0;
  const cacheKey = `series_cache_limit${limit}_offset${offset}`;
  if (canCache) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  const params = { limit, offset };
  if (q) params.titleStartsWith = q;
  const data = await getMarvelData("series", params, options);
  const results = data?.data?.results ?? [];
  if (canCache) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(results));
    } catch {}
  }
  return results;
}
