import express from "express";
import cors from "cors";
import axios from "axios";
import md5 from "md5";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS
app.use(cors({ origin: "*", methods: ["GET", "OPTIONS"] }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Log svakog zahtjeva
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const BASE = (
  process.env.MARVEL_API_URL ||
  process.env.VITE_MARVEL_API_URL ||
  "https://gateway.marvel.com/v1/public"
).trim();

const PUB = (
  process.env.MARVEL_PUBLIC_KEY ||
  process.env.VITE_MARVEL_PUBLIC_KEY ||
  ""
).trim();

const PRIV = (process.env.MARVEL_PRIVATE_KEY || "").trim();

if (!PUB || !PRIV) {
  console.error("Missing MARVEL_PUBLIC_KEY or MARVEL_PRIVATE_KEY");
  process.exit(1);
}

function signParams(params = {}) {
  const ts = String(Date.now());
  const hash = md5(ts + PRIV + PUB);
  return { ...params, ts, apikey: PUB, hash };
}

const marvelHeaders = {
  "User-Agent": "marvel-proxy/1.0",
  Accept: "application/json",
};

function forwardRetryAfter(res, upstream) {
  const ra =
    upstream?.headers?.["retry-after"] || upstream?.headers?.["Retry-After"];
  if (ra) res.set("Retry-After", ra);
}

// health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, base: BASE, pub_len: PUB.length });
});

// series
app.get("/api/series", async (req, res) => {
  try {
    const params = signParams({
      limit: req.query.limit || 20,
      offset: req.query.offset || 0,
      ...(req.query.titleStartsWith
        ? { titleStartsWith: req.query.titleStartsWith }
        : {}),
      ...(req.query.orderBy ? { orderBy: req.query.orderBy } : {}),
    });
    const { data } = await axios.get(`${BASE}/series`, {
      params,
      headers: marvelHeaders,
    });
    res.json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const body = e?.response?.data || { status: e.message };
    console.error("[PROXY ERROR] GET /series", status, body);
    forwardRetryAfter(res, e.response);
    res.status(status).json(body);
  }
});

app.get("/api/series/:id", async (req, res) => {
  try {
    const params = signParams();
    const { data } = await axios.get(`${BASE}/series/${req.params.id}`, {
      params,
      headers: marvelHeaders,
    });
    res.json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const body = e?.response?.data || { status: e.message };
    console.error("[PROXY ERROR] GET /series/:id", status, body);
    forwardRetryAfter(res, e.response);
    res.status(status).json(body);
  }
});

app.get("/api/series/:id/comics", async (req, res) => {
  try {
    const params = signParams({
      limit: req.query.limit || 5,
      offset: req.query.offset || 0,
    });
    const { data } = await axios.get(`${BASE}/series/${req.params.id}/comics`, {
      params,
      headers: marvelHeaders,
    });
    res.json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const body = e?.response?.data || { status: e.message };
    console.error("[PROXY ERROR] GET /series/:id/comics", status, body);
    forwardRetryAfter(res, e.response);
    res.status(status).json(body);
  }
});

// comics
app.get("/api/comics/:id", async (req, res) => {
  try {
    const params = signParams();
    const { data } = await axios.get(`${BASE}/comics/${req.params.id}`, {
      params,
      headers: marvelHeaders,
    });
    res.json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const body = e?.response?.data || { status: e.message };
    console.error("[PROXY ERROR] GET /comics/:id", status, body);
    forwardRetryAfter(res, e.response);
    res.status(status).json(body);
  }
});

app.get("/api/comics/:id/characters", async (req, res) => {
  try {
    const params = signParams({ limit: req.query.limit || 10 });
    const { data } = await axios.get(
      `${BASE}/comics/${req.params.id}/characters`,
      { params, headers: marvelHeaders }
    );
    res.json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const body = e?.response?.data || { status: e.message };
    console.error("[PROXY ERROR] GET /comics/:id/characters", status, body);
    forwardRetryAfter(res, e.response);
    res.status(status).json(body);
  }
});

// fallback error
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error("Unhandled:", err);
  res.set("Access-Control-Allow-Origin", "*");
  res
    .status(500)
    .json({ status: "proxy_error", message: err?.message || "Error" });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy listening on http://localhost:${PORT}`);
});
