import express from "express";
import cors from "cors";

import productsRoutes from "./routes/products.routes.js";
import climaRoutes from "./routes/clima.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// rutas
app.use("/products", productsRoutes);
app.use("/clima", climaRoutes);

// health check
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "AgroSmart API running ✅" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ AgroSmart API ready on http://localhost:${PORT}`)
);
