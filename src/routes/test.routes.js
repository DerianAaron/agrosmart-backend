import express from "express";
const router = express.Router();

/**
 * POST /test-post
 * Endpoint simple para pruebas de carga con POST.
 * Devuelve lo mismo que recibe.
 */
router.post("/test-post", (req, res) => {
  const body = req.body || {};

  res.json({
    ok: true,
    message: "POST recibido correctamente ✅",
    receivedAt: new Date().toISOString(),
    body,
  });
});

export default router;
