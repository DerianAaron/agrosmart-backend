import { Router } from "express";
import { firestore } from "../firebaseAdmin.js";

const router = Router();

/**
 * POST /test-firebase
 * Guarda un registro en Firestore para pruebas.
 */
router.post("/test-firebase", async (req, res) => {
  try {
    const body = req.body || {};

    const docRef = await firestore.collection("jmeter_tests").add({
      ...body,
      createdAt: new Date(),
      source: "JMeter",
    });

    res.json({
      ok: true,
      message: "✅ Guardado en Firestore",
      id: docRef.id,
      body,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
