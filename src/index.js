import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRoutes from "./routes/products.routes.js";
import climaRoutes from "./routes/clima.routes.js";
import testRoutes from "./routes/test.routes.js"; // POST /test-post (solo JMeter)
import testFirebaseRoutes from "./routes/testFirebase.routes.js"; // si lo estabas usando
import jmeterFirebaseRoutes from "./routes/jmeterFirebase.routes.js"; // POST /test-firebase/users

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rutas principales
app.use("/products", productsRoutes);
app.use("/clima", climaRoutes);

// rutas de test
app.use("/", testRoutes);           // /test-post
app.use("/", testFirebaseRoutes);   // /test-firebase (si existe)
app.use("/", jmeterFirebaseRoutes); // /test-firebase/users

// healthcheck
app.get("/", (req, res) => {
  res.json({ ok: true, name: "AgroSmart API" });
});

// server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`✅ AgroSmart API ready on http://localhost:${PORT}`)
);
