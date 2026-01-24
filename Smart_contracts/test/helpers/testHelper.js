const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Helper pour créer des cartes avec rareté contrôlée dans les tests
 */
async function mintCardWithRarity(andromeda, vrfCoordinator, user, rarity, ipfsHash = "QmTest") {
  // Calculer un nombre aléatoire qui donnera la rareté voulue
  let randomNumber;
  if (rarity === 0) randomNumber = 50;  // Common (0-69%)
  if (rarity === 1) randomNumber = 80;  // Rare (70-89%)
  if (rarity === 2) randomNumber = 95;  // Epic (90-97%)
  if (rarity === 3) randomNumber = 99;  // Legendary (98-99%)
  
  // Utiliser testMint au lieu du VRF
  const tx = await andromeda.connect(user).testMint(ipfsHash, randomNumber);
  const receipt = await tx.wait();
  
  // Retourner le tokenId (dernier token minté)
  const balance = await andromeda.balanceOf(user.address);
  return balance - 1n;
}

/**
 * Helper pour avancer le temps
 */
async function increaseTime(seconds) {
  await time.increase(seconds);
}

/**
 * Helper pour obtenir le timestamp actuel
 */
async function getCurrentTime() {
  return await time.latest();
}

module.exports = {
  mintCardWithRarity,
  increaseTime,
  getCurrentTime
};