import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from './contractConfig';
import AndromedaProtocolABI from '../contracts/AndromedaProtocol.json';

// ✅ RPC Alchemy direct — utilisé pour toutes les LECTURES
const ALCHEMY_RPC = 'https://eth-sepolia.g.alchemy.com/v2/-3XOQCj4AU1nDKEvYqKn4';

/**
 * Vérifie si MetaMask est installé
 */
export const isMetamaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Connecte le wallet MetaMask
 */
export const connectWallet = async () => {
  if (!isMetamaskInstalled()) {
    throw new Error("MetaMask n'est pas installé");
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    await checkAndSwitchNetwork();
    
    return accounts[0];
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw error;
  }
};

/**
 * Vérifie et change de réseau si nécessaire
 */
export const checkAndSwitchNetwork = async () => {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== NETWORK_CONFIG.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
        } else {
          throw switchError;
        }
      }
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    throw error;
  }
};

/**
 * Met en place un listener pour détecter les changements de réseau dans MetaMask.
 * Si l'utilisateur change de réseau vers autre chose que Sepolia, on recharge.
 */
export const setupNetworkListener = () => {
  if (typeof window === 'undefined' || !window.ethereum) return;

  const handleChainChanged = (chainId) => {
    console.log('Réseau changé vers:', chainId);
    if (chainId !== NETWORK_CONFIG.chainId) {
      console.warn('Réseau changé vers un autre que Sepolia — rechargement');
      window.location.reload();
    }
  };

  window.ethereum.on('chainChanged', handleChainChanged);
};

/**
 * ✅ Provider pour les LECTURES — va DIRECTEMENT vers Alchemy
 *    Ne passe PAS par MetaMask, donc pas d'erreur RPC 522
 */
export const getReadOnlyProvider = () => {
  return new ethers.JsonRpcProvider(ALCHEMY_RPC);
};

/**
 * ✅ Provider MetaMask — utilisé SEULEMENT pour signer les transactions
 */
export const getBrowserProvider = () => {
  if (!isMetamaskInstalled()) {
    throw new Error("MetaMask n'est pas installé");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Obtient le signer (MetaMask)
 */
export const getSigner = async () => {
  const provider = getBrowserProvider();
  return await provider.getSigner();
};

/**
 * ✅ Contrat en LECTURE SEULE — utilise JsonRpcProvider (Alchemy direct)
 *    Pour : balanceOf(), getUserCards(), getCard(), etc.
 */
export const getContractReadOnly = () => {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(
    CONTRACT_ADDRESS, 
    AndromedaProtocolABI.abi || AndromedaProtocolABI, 
    provider
  );
};

/**
 * ✅ Contrat pour ÉCRIRE — utilise BrowserProvider (MetaMask signe)
 *    Pour : mint(), transfer(), etc.
 */
export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESS, 
    AndromedaProtocolABI.abi || AndromedaProtocolABI, 
    signer
  );
};

/**
 * ✅ Récupère tous les tokenIds d'un utilisateur — LECTURE via Alchemy
 */
export const getAllTokenIds = async (address) => {
  try {
    const contract = getContractReadOnly();
    const tokenIds = await contract.getUserCards(address);
    return tokenIds.map(id => Number(id));
  } catch (error) {
    console.error("Erreur getAllTokenIds:", error);
    return [];
  }
};

/**
 * ✅ Récupère les détails d'une carte par tokenId — LECTURE via Alchemy
 */
export const getCardDetails = async (tokenId) => {
  try {
    const contract = getContractReadOnly();
    const card = await contract.getCard(tokenId);
    return {
      tokenId: Number(tokenId),
      name: card.name,
      race: Number(card.race),
      rarity: Number(card.rarity),
      value: Number(card.value),
      ipfsHash: card.ipfsHash,
      previousOwners: card.previousOwners,
      createdAt: Number(card.createdAt),
      lastTransferAt: Number(card.lastTransferAt),
      isLocked: card.isLocked,
      lockUntil: Number(card.lockUntil),
    };
  } catch (error) {
    console.error(`Erreur getCardDetails (token #${tokenId}):`, error);
    return null;
  }
};

// ========== Ancienne fonction getProvider — gardée pour compatibilité ==========
export const getProvider = () => {
  return getReadOnlyProvider();
};

/**
 * Formate une adresse
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formate un timestamp
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('fr-FR');
};

/**
 * Calcule le temps restant pour un cooldown
 */
export const getRemainingCooldown = (lastTransactionTime, cooldownDuration = 300) => {
  const now = Math.floor(Date.now() / 1000);
  const timePassed = now - lastTransactionTime;
  const remaining = cooldownDuration - timePassed;
  
  return remaining <= 0 ? 0 : remaining;
};

/**
 * Formate le cooldown
 */
export const formatCooldown = (seconds) => {
  if (seconds <= 0) return "Disponible";
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${minutes}m ${secs}s`;
};

/**
 * Vérifie si une carte est verrouillée
 */
export const isCardLocked = (lockUntil) => {
  const now = Math.floor(Date.now() / 1000);
  return lockUntil > now;
};

/**
 * Convertit un hash IPFS en URL
 */
export const getIPFSUrl = (hash) => {
  if (!hash) return '';
  const cleanHash = hash.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
};

/**
 * Gère les erreurs de transaction
 */
export const handleTransactionError = (error) => {
  console.error('Transaction error:', error);
  
  if (error.reason) {
    return `❌ Erreur: ${error.reason}`;
  }
  
  if (error.message) {
    if (error.message.includes('user rejected')) {
      return '❌ Transaction annulée';
    }
    if (error.message.includes('insufficient funds')) {
      return '❌ Fonds insuffisants';
    }
    return `❌ Erreur: ${error.message}`;
  }
  
  return '❌ Erreur lors de la transaction';
};