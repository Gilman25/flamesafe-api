const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ganti path ini dengan path file serviceAccountKey.json kamu
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Endpoint untuk kirim data sensor lingkungan ke Firestore
app.post("/api/kirimdata", async (req, res) => {
  try {
    console.log("Data diterima:", req.body);

    const {
      suhu,
      kelembaban,
      status_api,
      status_asap,
      timestamp
    } = req.body;

    // Validasi field wajib
    if (
      suhu === undefined ||
      kelembaban === undefined ||
      status_api === undefined ||
      status_asap === undefined ||
      !timestamp
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field (suhu, kelembaban, status_api, status_asap, timestamp) wajib diisi"
      });
    }

    // Simpan ke Firestore
    await db.collection("history").add({
      suhu: Number(suhu),
      kelembaban: Number(kelembaban),
      status_api: Boolean(status_api),
      status_asap: Boolean(status_asap),
      timestamp: new Date(timestamp)
    });

    return res.status(200).json({
      success: true,
      message: "Data berhasil dikirim ke Firestore"
    });
  } catch (error) {
    console.error("Error mengirim data:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Port default
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
