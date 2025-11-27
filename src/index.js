import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRoutes from "./routes/products.routes.js";
import climaRoutes from "./routes/clima.routes.js";
import testRoutes from "./routes/test.routes.js"; // tu POST test

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MOUNT CORRECTO
app.use("/products", productsRoutes);
app.use("/clima", climaRoutes);
app.use("/", testRoutes); // /test-post vive en raíz

app.get("/", (req, res) => {
  res.json({ ok: true, name: "AgroSmart API" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`✅ AgroSmart API ready on http://localhost:${PORT}`)
);
