const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ganti path ini dengan path file serviceAccountKey.json kamu
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Fungsi untuk dapatkan waktu sekarang dalam zona WIB
function getWaktuWIB() {
  const now = new Date();
  const offsetWIB = 7 * 60; // offset UTC+7 dalam menit
  const localTime = new Date(now.getTime() + offsetWIB * 60000 - now.getTimezoneOffset() * 60000);
  return localTime;
}

// Endpoint untuk kirim data sensor lingkungan ke Firestore
app.post("/api/kirimdata", async (req, res) => {
  try {
    console.log("Data diterima:", req.body);

    const {
      suhu,
      kelembaban,
      status_api,
      status_asap
      // timestamp diabaikan
    } = req.body;

    // Validasi field wajib (timestamp dihapus dari validasi)
    if (
      suhu === undefined ||
      kelembaban === undefined ||
      status_api === undefined ||
      status_asap === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Field (suhu, kelembaban, status_api, status_asap) wajib diisi"
      });
    }

    // Simpan ke Firestore dengan timestamp WIB
    await db.collection("history").add({
      suhu: Number(suhu),
      kelembaban: Number(kelembaban),
      status_api: Boolean(status_api),
      status_asap: Boolean(status_asap),
      timestamp: getWaktuWIB()
    });

    return res.status(200).json({
      success: true,
      message: "Data berhasil dikirim ke Firestore dengan timestamp WIB"
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
