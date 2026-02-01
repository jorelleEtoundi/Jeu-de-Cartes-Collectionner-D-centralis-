import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from './contractConfig';
import AndromedaProtocolABI from '../abi/AndromedaProtocol.json';

// RPC Alchemy direct — utilisé pour toutes les LECTURES
const ALCHEMY_RPC = 'https://eth-sepolia.g.alchemy.com/v2/-3XOQCj4AU1nDKEvYqKn4';

/* -------------------------------------------------------------------------- */
/*                               WALLET / NET                                 */
/* -------------------------------------------------------------------------- */

export const isMetamaskInstalled = () =>
  typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

export const connectWallet = async () => {
  if (!isMetamaskInstalled()) throw new Error("MetaMask n'est pas installé");

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  await checkAndSwitchNetwork();
  return accounts[0];
};

export const checkAndSwitchNetwork = async () => {
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
};

export const setupNetworkListener = () => {
  if (typeof window === 'undefined' || !window.ethereum) return;

  window.ethereum.on('chainChanged', (chainId) => {
    if (chainId !== NETWORK_CONFIG.chainId) window.location.reload();
  });
};

/* -------------------------------------------------------------------------- */
/*                                 PROVIDERS                                  */
/* -------------------------------------------------------------------------- */

export const getReadOnlyProvider = () => new ethers.JsonRpcProvider(ALCHEMY_RPC);

export const getBrowserProvider = () => {
  if (!isMetamaskInstalled()) throw new Error("MetaMask n'est pas installé");
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getBrowserProvider();
  return await provider.getSigner();
};

export const getContractReadOnly = () => {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    AndromedaProtocolABI.abi || AndromedaProtocolABI,
    provider
  );
};

export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    AndromedaProtocolABI.abi || AndromedaProtocolABI,
    signer
  );
};

// Compat
export const getProvider = () => getReadOnlyProvider();

/* -------------------------------------------------------------------------- */
/*                         ✅ LISTING TOKENS (ERC721Enumerable)                */
/* -------------------------------------------------------------------------- */

/**
 * LA correction clé :
 * Utilise ERC721Enumerable :
 * balanceOf(owner) + tokenOfOwnerByIndex(owner, i)
 *
 * Ça marche même si getUserCards() renvoie vide.
 */
export const getAllTokenIds = async (address) => {
  try {
    const contract = getContractReadOnly();
    const owner = ethers.getAddress(address);

    // 1) Méthode fiable : ERC721Enumerable
    try {
      const bal = await contract.balanceOf(owner); 
      const n = Number(bal);

      if (Number.isFinite(n) && n > 0) {
        const ids = await Promise.all(
          Array.from({ length: n }, (_, i) => contract.tokenOfOwnerByIndex(owner, i))
        );
        return ids.map((x) => x.toString());
      }
    } catch (e) {
      console.warn('[getAllTokenIds] ERC721Enumerable failed, fallback...', e?.message);
    }

    if (contract.getUserCards) {
      try {
        const ids = await contract.getUserCards(owner);
        return (ids || []).map((x) => x.toString());
      } catch (e2) {
        console.warn('[getAllTokenIds] getUserCards failed:', e2?.message);
      }
    }

    return [];
  } catch (error) {
    console.error('Erreur getAllTokenIds:', error);
    return [];
  }
};

/* -------------------------------------------------------------------------- */
/*                                CARD DETAILS                                */
/* -------------------------------------------------------------------------- */

export const getCardDetails = async (tokenId) => {
  try {
    const contract = getContractReadOnly();
    const id = tokenId?.toString?.() ?? String(tokenId);

    const card = await contract.getCard(id);

    return {
      tokenId: id,
      name: card.name,
      race: Number(card.race),
      rarity: Number(card.rarity),
      value: Number(card.value),
      ipfsHash: card.ipfsHash,
      previousOwners: card.previousOwners,
      createdAt: Number(card.createdAt),
      lastTransferAt: Number(card.lastTransferAt),
      isLocked: Boolean(card.isLocked),
      lockUntil: Number(card.lockUntil),
    };
  } catch (error) {
    console.error(`Erreur getCardDetails (token #${tokenId}):`, error);
    return null;
  }
};

export const getUserCardsDetailed = async (address) => {
  const tokenIds = await getAllTokenIds(address);
  if (!tokenIds || tokenIds.length === 0) return [];

  const cards = await Promise.all(
    tokenIds.map(async (id) => {
      const d = await getCardDetails(id);
      return d ?? { tokenId: String(id), name: `Carte #${id}`, ipfsHash: null, isLocked: false, lockUntil: 0 };
    })
  );

  return cards;
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('fr-FR');
};

export const getRemainingCooldown = (lastTransactionTime, cooldownDuration = 300) => {
  const now = Math.floor(Date.now() / 1000);
  const timePassed = now - Number(lastTransactionTime || 0);
  const remaining = cooldownDuration - timePassed;
  return remaining <= 0 ? 0 : remaining;
};


export const fetchCooldownRemaining = async (address) => {
  try {
    const contract = getContractReadOnly();
    const lastTx = await contract.lastTransactionTime(address);
    return getRemainingCooldown(Number(lastTx), 300);
  } catch (e) {
    console.error('[fetchCooldownRemaining]', e);
    return 0;
  }
};
export const formatCooldown = (seconds) => {
  const s = Number(seconds || 0);
  if (s <= 0) return 'Disponible';
  const minutes = Math.floor(s / 60);
  const secs = s % 60;
  return `${minutes}m ${secs}s`;
};

export const isCardLocked = (lockUntil) => {
  const now = Math.floor(Date.now() / 1000);
  return Number(lockUntil || 0) > now;
};

export const getIPFSUrl = (hash) => {
  if (!hash) return '';
  const cleanHash = String(hash).replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
};

export const handleTransactionError = (error) => {
  console.error('Transaction error:', error);

  if (error?.reason) return `❌ Erreur: ${error.reason}`;

  if (error?.message) {
    if (error.message.includes('user rejected')) return '❌ Transaction annulée';
    if (error.message.includes('insufficient funds')) return '❌ Fonds insuffisants';
    return `❌ Erreur: ${error.message}`;
  }

  return '❌ Erreur lors de la transaction';
};
