const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

const ipfsPath = path.join(__dirname, "ipfs-hashes.json");
let ipfsHashes = null;

const RARITY_VALUES = { common: 100, rare: 300, epic: 700, legendary: 1000 };
const RARITY_PREFIX = { common: "Scout", rare: "Elite", epic: "Legendary", legendary: "Mythic" };

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildMetadata(race, rarity, data) {
  return {
    name: `${RARITY_PREFIX[rarity]} ${cap(race)} Vessel`,
    type: cap(race),
    value: RARITY_VALUES[rarity],
    hash: data.imageHash,
    previousOwners: [],
    createdAt: null,
    lastTransferAt: null,
    rarity: cap(rarity),
    image: `ipfs://${data.imageHash}`,
    metadataUrl: data.metadataUrl,
    imageUrl: data.imageUrl
  };
}

function loadHashes() {
  if (!fs.existsSync(ipfsPath)) {
    console.error("ipfs-hashes.json introuvable :", ipfsPath);
    ipfsHashes = null;
    return;
  }
  try {
    const raw = fs.readFileSync(ipfsPath, "utf-8");
    ipfsHashes = JSON.parse(raw);
    console.log("ipfs-hashes.json charge");
  } catch (e) {
    console.error("ipfs-hashes.json invalide.", e.message);
    ipfsHashes = null;
  }
}

loadHashes();

app.get("/health", (req, res) => {
  res.json({ ok: true, hasHashes: !!ipfsHashes });
});

app.get("/api/cards", (req, res) => {
  if (!ipfsHashes) return res.status(500).json({ error: "Hashes not loaded" });
  const allCards = [];
  for (const [race, rarities] of Object.entries(ipfsHashes)) {
    for (const [rarity, data] of Object.entries(rarities)) {
      allCards.push({ id: `${race}-${rarity}`, ...buildMetadata(race, rarity, data) });
    }
  }
  res.json({ cards: allCards });
});

app.get("/api/cards/:race/:rarity", (req, res) => {
  if (!ipfsHashes) return res.status(500).json({ error: "Hashes not loaded" });
  const { race, rarity } = req.params;
  if (!ipfsHashes[race] || !ipfsHashes[race][rarity]) {
    return res.status(404).json({ error: "Card not found" });
  }
  res.json({ id: `${race}-${rarity}`, ...buildMetadata(race, rarity, ipfsHashes[race][rarity]) });
});

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
    ...buildMetadata(randomRace, randomRarity, card)
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
