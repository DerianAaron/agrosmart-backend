import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import climaRoutes from "./routes/clima.routes.js";
import productsRoutes from "./routes/products.routes.js";
import testRoutes from "./routes/test.routes.js";  // 👈 NUEVO

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // ✅ IMPORTANTE para leer JSON en POST

// rutas
app.use("/", climaRoutes);
app.use("/", productsRoutes);
app.use("/", testRoutes); // 👈 NUEVO

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ AgroSmart API ready on http://localhost:${PORT}`);
});
