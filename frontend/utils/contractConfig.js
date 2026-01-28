// Contract configuration for Andromeda Protocol
export const CONTRACT_ADDRESS = "0x317Fbed8fD8491B080f98A8e3540A6cb190908d7";

export const NETWORK_CONFIG = {
  chainId: "0xaa36a7", // 11155111 en hexadécimal (Sepolia)
  chainName: "Sepolia Test Network",
  rpcUrls: [
    "https://rpc.sepolia.org",
    "https://sepolia-rpc.publicnode.com",
    "https://eth-sepolia.g.alchemy.com/v2/demo",
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18
  }
};

// IPFS Gateway pour afficher les images
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// Valeurs des raretés
export const RARITY_VALUES = {
  0: 100,   // Common
  1: 300,   // Rare
  2: 700,   // Epic
  3: 1000   // Legendary
};

// Noms des races
export const RACE_NAMES = {
  0: "Humans",
  1: "Zephyrs",
  2: "Kraths",
  3: "Preservers",
  4: "Synthetics",
  5: "Aquarians",
  6: "Ancients"
};

// Noms des raretés
export const RARITY_NAMES = {
  0: "Common",
  1: "Rare",
  2: "Epic",
  3: "Legendary"
};

// Couleurs pour chaque rareté (pour l'UI)
export const RARITY_COLORS = {
  0: "#9CA3AF", // Gray pour Common
  1: "#3B82F6", // Blue pour Rare
  2: "#8B5CF6", // Purple pour Epic
  3: "#F59E0B"  // Gold pour Legendary
};
