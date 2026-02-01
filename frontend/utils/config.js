// Configuration du contrat Andromeda Protocol
export const CONTRACT_ADDRESS = "0x317Fbed8fD8491B080f98A8e3540A6cb190908d7";

// Configuration du réseau Sepolia
export const SEPOLIA_CHAIN_ID = "0xaa36a7"; 
export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://sepolia.infura.io/v3/"],
  blockExplorerUrls: ["https://sepolia.etherscan.io/"]
};

// Énumérations du contrat
export const RARITY = {
  0: "Common",
  1: "Rare", 
  2: "Epic",
  3: "Legendary"
};

export const RACE = {
  0: "Humans",
  1: "Zephyrs",
  2: "Kraths",
  3: "Preservers",
  4: "Synthetics",
  5: "Aquarians",
  6: "Ancients"
};

// Valeurs des raretés
export const RARITY_VALUES = {
  Common: 100,
  Rare: 300,
  Epic: 700,
  Legendary: 1000
};

// Constantes du jeu
export const MAX_CARDS_PER_OWNER = 10;
export const TRANSACTION_COOLDOWN = 5 * 60; 
export const LOCK_DURATION = 10 * 60; 

// Gateway IPFS
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
