// server.js (CommonJS)
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ CORS : autorise Vite (5173) + requêtes cross-domain
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json());

// ✅ Charge ipfs-hashes.json proprement
const ipfsPath = path.join(__dirname, "ipfs-hashes.json");
let ipfsHashes = null;

function loadHashes() {
  if (!fs.existsSync(ipfsPath)) {
    console.error("❌ ipfs-hashes.json introuvable :", ipfsPath);
    console.error("👉 Génère-le avec: node scripts/uploadToIPFS.js");
    ipfsHashes = null;
    return;
  }

  try {
    const raw = fs.readFileSync(ipfsPath, "utf-8");
    ipfsHashes = JSON.parse(raw);
    console.log("✅ ipfs-hashes.json chargé");
  } catch (e) {
    console.error("❌ ipfs-hashes.json invalide (JSON parse error).", e.message);
    ipfsHashes = null;
  }
}
loadHashes();

// (Optionnel) Healthcheck
app.get("/health", (req, res) => {
  res.json({ ok: true, hasHashes: !!ipfsHashes });
});

// ✅ Toutes les cartes (guide: GET /api/cards)
app.get("/api/cards", (req, res) => {
  if (!ipfsHashes) return res.status(500).json({ error: "Hashes not loaded" });

  const allCards = [];
  for (const [race, rarities] of Object.entries(ipfsHashes)) {
    for (const [rarity, data] of Object.entries(rarities)) {
      allCards.push({ id: `${race}-${rarity}`, race, rarity, ...data });
    }
  }
  res.json({ cards: allCards });
});

// ✅ Carte spécifique (guide: GET /api/cards/:race/:rarity)
app.get("/api/cards/:race/:rarity", (req, res) => {
  if (!ipfsHashes) return res.status(500).json({ error: "Hashes not loaded" });

  const { race, rarity } = req.params;
  if (!ipfsHashes[race] || !ipfsHashes[race][rarity]) {
    return res.status(404).json({ error: "Card not found" });
  }

  res.json({ id: `${race}-${rarity}`, race, rarity, ...ipfsHashes[race][rarity] });
});

// ✅ Hash aléatoire pour mint (guide: GET /api/random-metadata)
app.get("/api/random-metadata", (req, res) => {
  if (!ipfsHashes) return res.status(500).json({ error: "Hashes not loaded" });

  const races = Object.keys(ipfsHashes);
  const randomRace = races[Math.floor(Math.random() * races.length)];

  const rarities = Object.keys(ipfsHashes[randomRace]);
  const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];

  const card = ipfsHashes[randomRace][randomRarity];

  res.json({
    metadataHash: card.metadataHash,
    race: randomRace,
    rarity: randomRarity,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
