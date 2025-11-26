import { Router } from "express";
import {
  getCurrentWeather,
  getForecast,
  getClimateAlerts,
} from "../services/clima.service.js";

const router = Router();

// GET /clima?city=Arequipa
router.get("/", async (req, res) => {
  const { city } = req.query;
  try {
    const data = await getCurrentWeather(city);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /clima/forecast?city=Arequipa&days=7
router.get("/forecast", async (req, res) => {
  const { city, days } = req.query;
  try {
    const data = await getForecast(city, days);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /clima/alerts?city=Arequipa
router.get("/alerts", async (req, res) => {
  const { city } = req.query;
  try {
    const data = await getClimateAlerts(city);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
