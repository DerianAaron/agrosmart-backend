import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJSON(relPath) {
  const p = path.join(__dirname, relPath);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const productsDB = readJSON("../data/products.json");
const marketsDB = readJSON("../data/markets.json");
let historiesDB = readJSON("../data/histories.json");

const rand = (min, max) => Math.random() * (max - min) + min;

function categoryRange(category) {
  const c = category.toLowerCase();
  if (c.includes("tubérculo") || c.includes("tuberculo")) return [1.5, 6];
  if (c.includes("cereal")) return [2, 12];
  if (c.includes("hortaliza")) return [1, 8];
  if (c.includes("fruta")) return [2, 15];
  if (c.includes("legumbre")) return [3, 18];
  return [2, 10];
}

function priceNow(product, market) {
  const [min, max] = categoryRange(product.category);
  const base = rand(min, max);

  const marketFactor =
    market.toLowerCase() === "lima" ? 1.1 :
    market.toLowerCase() === "cusco" ? 1.05 :
    market.toLowerCase() === "puno" ? 0.95 : 1.0;

  return +(base * marketFactor).toFixed(2);
}

function buildVariation(today, yesterday) {
  const pct =
    yesterday === 0 ? 0 : ((today - yesterday) / yesterday) * 100;
  return +pct.toFixed(2);
}

function ensureHistory(productKey, marketKey) {
  const histKey = `${productKey}-${marketKey}`;

  if (!historiesDB[histKey]) {
    const series = [];
    let startPrice = rand(2, 8);

    for (let i = 44; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      startPrice += rand(-0.2, 0.2);
      if (startPrice < 0.8) startPrice = 0.8;

      series.push({
        date: d.toISOString().slice(0, 10),
        price: +startPrice.toFixed(2),
      });
    }

    historiesDB[histKey] = series;

    fs.writeFileSync(
      path.join(__dirname, "../data/histories.json"),
      JSON.stringify(historiesDB, null, 2)
    );
  }

  return historiesDB[histKey];
}

// ✅ Buscar / listar productos
export async function searchProducts(query = "", market = "Arequipa") {
  const q = query.toLowerCase();
  const marketKey = market.toLowerCase();

  const filtered = productsDB.filter((p) =>
    p.productName.toLowerCase().includes(q)
  );

  return filtered.map((p) => {
    const hist = ensureHistory(p.productKey, marketKey);
    const yesterday = hist[hist.length - 2]?.price ?? priceNow(p, market);
    const today = priceNow(p, market);

    return {
      productKey: p.productKey,
      productName: p.productName,
      category: p.category,
      unit: p.unit,
      market,
      price: today,
      currency: "PEN",
      variation: {
        vsYesterdayPct: buildVariation(today, yesterday),
        vsWeekPct: buildVariation(
          today,
          hist[Math.max(hist.length - 8, 0)]?.price ?? yesterday
        ),
      },
      updatedAt: new Date().toISOString(),
      source: "mock",
    };
  });
}

// ✅ Detalle producto
export async function getProductDetail(productKey) {
  const prod = productsDB.find((p) => p.productKey === productKey);
  if (!prod) return null;

  const markets = marketsDB.map((m) => {
    const hist = ensureHistory(productKey, m.marketKey);
    const today = priceNow(prod, m.marketName);

    return {
      market: m.marketName,
      unit: prod.unit,
      price: today,
      currency: "PEN",
      updatedAt: new Date().toISOString(),
      vsYesterdayPct: buildVariation(
        today,
        hist[hist.length - 2]?.price ?? today
      ),
    };
  });

  return {
    ...prod,
    markets,
    source: "mock",
  };
}

// ✅ Historial para gráficas/alertas
export async function getProductHistory(productKey, market = "Arequipa", period = "30d") {
  const prod = productsDB.find((p) => p.productKey === productKey);
  if (!prod) return null;

  const marketKey = market.toLowerCase();
  const hist = ensureHistory(productKey, marketKey);

  const days = parseInt(period) || 30;
  const series = hist.slice(-days);

  const prices = series.map((s) => s.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  const trend =
    series[series.length - 1].price > series[0].price
      ? "up"
      : series[series.length - 1].price < series[0].price
      ? "down"
      : "flat";

  return {
    productKey,
    productName: prod.productName,
    market,
    unit: prod.unit,
    currency: "PEN",
    periodDays: days,
    series,
    trend,
    avgPrice: +avg.toFixed(2),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    source: "mock",
  };
}

// ✅ Mercados
export async function getMarkets() {
  return marketsDB;
}

// ✅ Categorías
export async function getCategories() {
  const cats = [...new Set(productsDB.map((p) => p.category))];
  return cats.sort();
}

// ✅ Trending por variación diaria (más pro para home)
export async function getTrending(market = "Arequipa", limit = 6) {
  const marketKey = market.toLowerCase();

  const all = productsDB.map((p) => {
    const hist = ensureHistory(p.productKey, marketKey);
    const yesterday = hist[hist.length - 2]?.price ?? priceNow(p, market);
    const today = priceNow(p, market);
    const varPct = buildVariation(today, yesterday);

    return {
      productKey: p.productKey,
      productName: p.productName,
      category: p.category,
      market,
      price: today,
      currency: "PEN",
      vsYesterdayPct: varPct,
      updatedAt: new Date().toISOString(),
      source: "mock",
    };
  });

  all.sort((a, b) => Math.abs(b.vsYesterdayPct) - Math.abs(a.vsYesterdayPct));
  return all.slice(0, Number(limit) || 6);
}
