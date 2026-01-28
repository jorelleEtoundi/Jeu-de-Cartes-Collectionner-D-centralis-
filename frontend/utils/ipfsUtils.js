import { IPFS_GATEWAY } from './config';

// Import des hashes IPFS depuis le frontend
import ipfsHashes from '../public/ipfs-hashes.json';

/**
 * Récupère l'URL complète IPFS depuis un hash
 */
export const getIPFSUrl = (hash) => {
  if (!hash) return '';
  // Supprimer le préfixe ipfs:// si présent
  const cleanHash = hash.replace('ipfs://', '');
  return `${IPFS_GATEWAY}${cleanHash}`;
};

/**
 * Récupère les métadonnées d'une carte depuis IPFS
 */
export const getCardMetadata = async (ipfsHash) => {
  try {
    const url = getIPFSUrl(ipfsHash);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des métadonnées');
    }
    
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Erreur métadonnées IPFS:', error);
    return null;
  }
};

/**
 * Récupère le hash IPFS selon la race et la rareté
 */
export const getIPFSHashForCard = (race, rarity) => {
  try {
    const raceName = race.toLowerCase();
    const rarityName = rarity.toLowerCase();
    
    if (ipfsHashes[raceName] && ipfsHashes[raceName][rarityName]) {
      return ipfsHashes[raceName][rarityName].metadataHash;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur récupération hash IPFS:', error);
    return null;
  }
};

/**
 * Récupère l'URL de l'image d'une carte
 */
export const getCardImageUrl = (race, rarity) => {
  try {
    const raceName = race.toLowerCase();
    const rarityName = rarity.toLowerCase();
    
    if (ipfsHashes[raceName] && ipfsHashes[raceName][rarityName]) {
      const imageHash = ipfsHashes[raceName][rarityName].imageHash;
      return getIPFSUrl(imageHash);
    }
    
    return '/images/card-placeholder.png';
  } catch (error) {
    console.error('Erreur récupération image:', error);
    return '/images/card-placeholder.png';
  }
};

/**
 * Récupère toutes les données d'une carte (métadonnées + image)
 */
export const getFullCardData = async (card) => {
  try {
    const imageUrl = getCardImageUrl(card.race, card.rarity);
    const metadata = await getCardMetadata(card.ipfsHash);
    
    return {
      ...card,
      imageUrl,
      metadata
    };
  } catch (error) {
    console.error('Erreur récupération données carte:', error);
    return card;
  }
};

/**
 * Récupère le hash IPFS pour une nouvelle carte à minter
 */
export const getRandomIPFSHash = () => {
  const races = Object.keys(ipfsHashes);
  const rarities = ['common', 'rare', 'epic', 'legendary'];
  
  // Sélection aléatoire (pour simulation, le vrai random sera fait par VRF)
  const randomRace = races[Math.floor(Math.random() * races.length)];
  const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
  
  return ipfsHashes[randomRace][randomRarity].metadataHash;
};

export default ipfsHashes;
