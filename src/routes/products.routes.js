import { Router } from "express";
import {
  searchProducts,
  getProductDetail,
  getProductHistory,
  getMarkets,
  getCategories,
  getTrending,
} from "../services/products.service.js";

const router = Router();

// ✅ GET /products?market=Arequipa  -> lista todo
router.get("/", async (req, res) => {
  const { market } = req.query;
  try {
    const data = await searchProducts("", market || "Arequipa");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ GET /products/search?query=papa&market=Arequipa
router.get("/search", async (req, res) => {
  const { query, market } = req.query;
  try {
    const data = await searchProducts(query || "", market || "Arequipa");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ GET /products/markets
router.get("/markets", async (req, res) => {
  try {
    const data = await getMarkets();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ GET /products/categories
router.get("/categories", async (req, res) => {
  try {
    const data = await getCategories();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ GET /products/trending?market=Arequipa&limit=6
router.get("/trending", async (req, res) => {
  const { market, limit } = req.query;
  try {
    const data = await getTrending(market || "Arequipa", limit || 6);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ GET /products/:productKey
router.get("/:productKey", async (req, res) => {
  try {
    const data = await getProductDetail(req.params.productKey);
    if (!data) return res.status(404).json({ error: "Producto no existe" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ GET /products/:productKey/history?market=Arequipa&period=30d
router.get("/:productKey/history", async (req, res) => {
  const { market, period } = req.query;
  try {
    const data = await getProductHistory(
      req.params.productKey,
      market || "Arequipa",
      period || "30d"
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
