/**
 * Récupère tous les tokenIds ERC-721 possédés par une adresse (owner)
 * Utilise balanceOf + tokenOfOwnerByIndex (standard ERC-721 Enumerable)
 * @param {string} owner Adresse du propriétaire
 * @returns {Promise<number[]>} Liste des tokenIds
 */
export const getAllTokenIds = async (owner) => {
  if (!owner) return [];
  try {
    const contract = await getContractReadOnly();
    const balance = await contract.balanceOf(owner);
    const tokenIds = [];
    for (let i = 0; i < balance; i++) {
      // tokenOfOwnerByIndex(address, index) => tokenId
      const tokenId = await contract.tokenOfOwnerByIndex(owner, i);
      tokenIds.push(Number(tokenId));
    }
    return tokenIds;
  } catch (err) {
    console.error('Erreur getAllTokenIds:', err);
    return [];
  }
};

/**
 * Récupère les détails d'une carte via cards(tokenId)
 * @param {number|string} tokenId ID du token
 * @returns {Promise<Object>} Détails structurés de la carte
 */
export const getCardDetails = async (tokenId) => {
  if (tokenId === undefined || tokenId === null) return null;
  try {
    const contract = getContractReadOnly();
    const card = await contract.cards(tokenId);
    
    return {
      tokenId: Number(tokenId),
      name: card.name,
      race: card.race,
      rarity: card.rarity,
      value: card.value,
      ipfsHash: card.ipfsHash,
      previousOwners: card.previousOwners,
      createdAt: Number(card.createdAt),
      lastTransferAt: Number(card.lastTransferAt),
      isLocked: card.isLocked,
      lockUntil: Number(card.lockUntil)
    };
  } catch (err) {
    console.error(`Erreur getCardDetails(${tokenId}):`, err);
    return null;
  }
};
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from './contractConfig';
import AndromedaProtocolABI from '../contracts/AndromedaProtocol.json';

/**
 * Vérifie si Metamask est installé
 */
export const isMetamaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Connecte le wallet Metamask
 */
export const connectWallet = async () => {
  if (!isMetamaskInstalled()) {
    throw new Error("Metamask n'est pas installé. Veuillez installer Metamask pour continuer.");
  }

  try {
    // Demander l'autorisation de connexion
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    // Vérifier le réseau
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
    if (!isMetamaskInstalled()) {
      throw new Error("Metamask n'est pas installé");
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    console.log(`Réseau actuel: ${chainId}`);
    console.log(`Réseau cible: ${NETWORK_CONFIG.chainId}`);
    
    if (chainId !== NETWORK_CONFIG.chainId) {
      try {
        console.log(`🔄 Tentative de changement vers ${NETWORK_CONFIG.chainName}...`);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
        console.log(`✅ Réseau changé vers ${NETWORK_CONFIG.chainName}`);
        return true;
      } catch (switchError) {
        // Si le réseau n'existe pas, on l'ajoute
        if (switchError.code === 4902) {
          console.log(`⚠️ Réseau ${NETWORK_CONFIG.chainName} non trouvé dans Metamask`);
          console.log(`📝 Ajout du réseau ${NETWORK_CONFIG.chainName}...`);
          
          try {
            const result = await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: NETWORK_CONFIG.chainId,
                chainName: NETWORK_CONFIG.chainName,
                rpcUrls: NETWORK_CONFIG.rpcUrls,
                blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls,
                nativeCurrency: NETWORK_CONFIG.nativeCurrency,
              }],
            });
            
            console.log(`✅ Réseau ${NETWORK_CONFIG.chainName} ajouté avec succès`);
            console.log(`📍 RPC utilisé: ${NETWORK_CONFIG.rpcUrls[0]}`);
            return true;
          } catch (addError) {
            console.error("❌ Erreur lors de l'ajout du réseau:", {
              code: addError.code,
              message: addError.message,
            });
            
            if (addError.code === 4001) {
              throw new Error("Vous avez refusé d'ajouter le réseau Sepolia. L'application ne peut pas fonctionner sans ce réseau.");
            } else {
              throw new Error(`❌ Impossible d'ajouter ${NETWORK_CONFIG.chainName}.\n\nVeuillez l'ajouter manuellement dans Metamask:\n- Chain ID: 11155111\n- RPC: ${NETWORK_CONFIG.rpcUrls[0]}\n- Symbol: ETH\n- Explorer: ${NETWORK_CONFIG.blockExplorerUrls[0]}`);
            }
          }
        } else if (switchError.code === 4001) {
          // Utilisateur a refusé le changement
          throw new Error("⚠️ Vous devez accepter le changement vers Sepolia pour continuer.");
        } else {
          console.error("Erreur lors du changement de réseau:", {
            code: switchError.code,
            message: switchError.message,
          });
          throw new Error(`Erreur lors du changement de réseau: ${switchError.message}`);
        }
      }
    } else {
      console.log(`✅ Déjà connecté à ${NETWORK_CONFIG.chainName}`);
      return true;
    }
  } catch (error) {
    console.error("❌ Erreur complète:", error);
    throw error;
  }
};

/**
 * Écoute les changements de réseau et recharge la page si nécessaire
 */
export const setupNetworkListener = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      console.log(`Réseau changé vers ${chainId}`);
      // Recharger pour s'assurer que tout est à jour
      if (chainId !== NETWORK_CONFIG.chainId) {
        console.warn(`⚠️ Vous êtes passé sur un réseau différent. Redémarrage...`);
        // Optionnel: recharger la page
        // window.location.reload();
      }
    });

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        console.log('Wallet déconnecté');
      } else {
        console.log(`Compte changé: ${accounts[0]}`);
      }
    });
  }
};

/**
 * Obtient le provider Ethers
 */
export const getProvider = () => {
  if (!isMetamaskInstalled()) {
    throw new Error("Metamask n'est pas installé");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Obtient le signer (pour les transactions)
 */
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

/**
 * Obtient l'instance du contrat
 */
export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, AndromedaProtocolABI, signer);
};

/**
 * Obtient l'instance du contrat en lecture seule
 */
export const getContractReadOnly = () => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, AndromedaProtocolABI, provider);
};

/**
 * Formate une adresse Ethereum pour l'affichage
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formate un timestamp en date lisible
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
  
  if (remaining <= 0) return 0;
  
  return remaining;
};

/**
 * Formate le temps restant en minutes et secondes
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
 * Convertit un hash IPFS en URL complète
 */
export const getIPFSUrl = (hash) => {
  if (!hash) return '';
  // Retire le préfixe ipfs:// si présent
  const cleanHash = hash.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
};

/**
 * Gère les erreurs de transaction et retourne un message lisible
 */
export const handleTransactionError = (error) => {
  console.error('Transaction error:', error);
  
  if (error.reason) {
    return `❌ Erreur: ${error.reason}`;
  }
  
  if (error.message) {
    if (error.message.includes('user rejected')) {
      return '❌ Transaction annulée par l\'utilisateur';
    }
    if (error.message.includes('insufficient funds')) {
      return '❌ Fonds insuffisants pour la transaction';
    }
    if (error.message.includes('Contract execution reverted')) {
      return '❌ Contrat a rejeté la transaction';
    }
    return `❌ Erreur: ${error.message}`;
  }
  
  return '❌ Une erreur est survenue lors de la transaction';
};
