import { Router } from "express";
import { firestore } from "../firebaseAdmin.js";

const router = Router();

/**
 * POST /test-firebase/users
 * Crea usuarios random de prueba en Firestore
 */
router.post("/test-firebase/users", async (req, res) => {
  try {
    // si JMeter manda body, lo usamos, si no, igual creamos random
    const body = req.body || {};

    const randomId = Math.floor(Math.random() * 1000000);

    const fakeUser = {
      name: body.name || `User Test ${randomId}`,
      email: body.email || `test${randomId}@agrosmart.com`,
      city: body.city || "Arequipa",
      createdAt: new Date(),
      source: "JMeter",
    };

    const ref = await firestore.collection("jmeter_users").add(fakeUser);

    res.json({
      ok: true,
      message: "✅ Usuario test guardado en Firestore",
      id: ref.id,
      user: fakeUser,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
