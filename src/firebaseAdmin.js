import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

if (!b64) {
  throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_B64");
}

let serviceAccount;
try {
  const raw = Buffer.from(b64, "base64").toString("utf8");
  serviceAccount = JSON.parse(raw);
} catch (e) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 no es JSON válido");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firestore = admin.firestore();
export const auth = admin.auth();
