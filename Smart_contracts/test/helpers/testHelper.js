const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Helper pour créer des cartes avec rareté contrôlée dans les tests
 */
async function mintCardWithRarity(andromeda, vrfCoordinator, user, rarity, ipfsHash = "QmTest") {
  let randomNumber;
  if (rarity === 0) randomNumber = 50;  
  if (rarity === 1) randomNumber = 80;  
  if (rarity === 2) randomNumber = 95; 
  if (rarity === 3) randomNumber = 99;  
  
  const tx = await andromeda.connect(user).testMint(ipfsHash, randomNumber);
  const receipt = await tx.wait();
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