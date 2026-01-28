import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from './config';
import ContractABI from '../contracts/AndromedaProtocol.json';

/**
 * Connect to MetaMask wallet
 * @returns {Object} { provider, signer, address }
 */
export async function connectWallet() {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed!");
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // Create provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Check if connected to Sepolia
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
      await switchToSepolia();
    }

    return { provider, signer, address };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

/**
 * Switch network to Sepolia
 */
export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
}

/**
 * Get contract instance
 * @param {Object} signer - Ethers signer
 * @returns {Object} Contract instance
 */
export function getContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
}

/**
 * Get contract instance with provider (read-only)
 * @param {Object} provider - Ethers provider
 * @returns {Object} Contract instance
 */
export function getContractReadOnly(provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ContractABI, provider);
}

/**
 * Format address for display
 * @param {string} address 
 * @returns {string} Formatted address
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp 
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Check if cooldown is active
 * @param {number} lastTransactionTime - Timestamp
 * @param {number} cooldownDuration - Duration in seconds
 * @returns {Object} { isActive, remainingTime }
 */
export function checkCooldown(lastTransactionTime, cooldownDuration) {
  const now = Math.floor(Date.now() / 1000);
  const timePassed = now - lastTransactionTime;
  const isActive = timePassed < cooldownDuration;
  const remainingTime = isActive ? cooldownDuration - timePassed : 0;
  
  return { isActive, remainingTime };
}

/**
 * Format cooldown time
 * @param {number} seconds 
 * @returns {string}
 */
export function formatCooldownTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert IPFS hash to HTTP URL
 * @param {string} ipfsHash 
 * @returns {string}
 */
export function ipfsToHttp(ipfsHash) {
  if (!ipfsHash) return '';
  
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '');
  
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

/**
 * Handle transaction errors
 * @param {Error} error 
 * @returns {string} User-friendly error message
 */
export function handleTransactionError(error) {
  console.error("Transaction error:", error);
  
  if (error.code === 4001) {
    return "Transaction rejected by user";
  }
  
  if (error.message.includes("CooldownActive")) {
    return "Please wait for the cooldown period to end";
  }
  
  if (error.message.includes("MaxCardsReached")) {
    return "You have reached the maximum of 10 cards. Fuse or exchange cards to free space.";
  }
  
  if (error.message.includes("CardLocked")) {
    return "This card is locked. Please wait for the lock period to end.";
  }
  
  if (error.message.includes("InsufficientLINK")) {
    return "Insufficient LINK tokens for minting. Please add LINK to the contract.";
  }
  
  if (error.message.includes("NotCardOwner")) {
    return "You don't own this card";
  }
  
  if (error.message.includes("RarityMismatch")) {
    return "Cards must have the same rarity for exchange";
  }
  
  if (error.message.includes("CannotFuseLegendary")) {
    return "Legendary cards cannot be fused further";
  }
  
  return error.message || "Transaction failed. Please try again.";
}
