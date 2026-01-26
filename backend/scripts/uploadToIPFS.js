require("dotenv").config();
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

if (!PINATA_API_KEY || !PINATA_API_SECRET) {
  console.error("❌ PINATA_API_KEY / PINATA_API_SECRET manquants dans .env");
  process.exit(1);
}

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

const RACES = ["humans", "zephyrs", "kraths", "preservers", "synthetics", "aquarians", "ancients"];
const RARITIES = ["common", "rare", "epic", "legendary"];

const RARITY_VALUES = { common: 100, rare: 300, epic: 700, legendary: 1000 };

const rarityPrefix = { common: "Scout", rare: "Elite", epic: "Legendary", legendary: "Mythic" };

const descriptions = {
  humans: "A vessel from Earth, representing humanity's expansion into the cosmos.",
  zephyrs: "Masters of atmospheric navigation, the Zephyrs glide through nebulae with grace.",
  kraths: "Fearsome warriors, the Kraths dominate the battlefield with raw power.",
  preservers: "Ancient guardians of forgotten knowledge and cosmic balance.",
  synthetics: "Advanced AI constructs, transcending organic limitations.",
  aquarians: "Adapted to liquid environments, masters of fluid dynamics.",
  ancients: "Remnants of a long-lost civilization, wielding forgotten technology."
};

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function uploadImage(race, rarity) {
  const imagePath = path.join(__dirname, "..", "images", race, `${rarity}.png`);

  if (!fs.existsSync(imagePath)) {
    console.error(`⚠️  Image introuvable: ${imagePath}`);
    return null;
  }

  const stream = fs.createReadStream(imagePath);

  try {
    const res = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: `${race}-${rarity}.png` }
    });

    console.log(`✅ Image OK: ${race}/${rarity} -> ${res.IpfsHash}`);
    return res.IpfsHash;
  } catch (e) {
    console.error(`❌ Upload image KO: ${race}/${rarity}`, e?.message || e);
    return null;
  }
}

function createMetadata(race, rarity, imageHash) {
  const raceCap = cap(race);
  const rarityCap = cap(rarity);

  return {
    name: `${rarityPrefix[rarity]} ${raceCap} Vessel`,
    description: descriptions[race],
    image: `ipfs://${imageHash}`,
    external_url: `https://andromedaprotocol.io/card/${race}-${rarity}`,
    attributes: [
      { trait_type: "Race", value: raceCap },
      { trait_type: "Rarity", value: rarityCap },
      { trait_type: "Value", value: RARITY_VALUES[rarity] },
      { trait_type: "Power", value: Math.floor(Math.random() * 50) + (RARITY_VALUES[rarity] / 10) },
      { trait_type: "Speed", value: Math.floor(Math.random() * 50) + (RARITY_VALUES[rarity] / 10) },
      { trait_type: "Defense", value: Math.floor(Math.random() * 50) + (RARITY_VALUES[rarity] / 10) }
    ]
  };
}

async function uploadMetadata(race, rarity, imageHash) {
  const metadata = createMetadata(race, rarity, imageHash);

  try {
    const res = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: `${race}-${rarity}-metadata.json` },
      pinataOptions: { cidVersion: 0 }
    });

    console.log(`✅ Metadata OK: ${race}/${rarity} -> ${res.IpfsHash}`);
    return res.IpfsHash;
  } catch (e) {
    console.error(`❌ Upload metadata KO: ${race}/${rarity}`, e?.message || e);
    return null;
  }
}

async function main() {
  const results = {};

  for (const race of RACES) {
    results[race] = {};

    for (const rarity of RARITIES) {
      console.log(`\n📤 Traitement: ${race} - ${rarity}`);

      const imageHash = await uploadImage(race, rarity);
      if (!imageHash) continue;

      const metadataHash = await uploadMetadata(race, rarity, imageHash);
      if (!metadataHash) continue;

      results[race][rarity] = {
        imageHash,
        metadataHash,
        imageUrl: `ipfs://${imageHash}`,
        metadataUrl: `ipfs://${metadataHash}`
      };
    }
  }

  fs.writeFileSync("ipfs-hashes.json", JSON.stringify(results, null, 2));
  console.log("\n✅ Terminé ! Fichier généré: ipfs-hashes.json");
}

main().catch(console.error);
