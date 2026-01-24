const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Helper pour créer des cartes avec rareté contrôlée dans les tests
 */
async function mintCardWithRarity(andromeda, vrfCoordinator, user, rarity, ipfsHash = "QmTest") {
  // Demander un mint
  const tx = await andromeda.connect(user).mint(ipfsHash);
  const receipt = await tx.wait();
  
  // Extraire le requestId de l'event
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === 'RandomnessRequest'
  );
  
  let requestId;
  if (event) {
    requestId = event.args[2]; // requestId est le 3ème argument
  } else {
    // Fallback: calculer le requestId
    const nonce = await ethers.provider.getTransactionCount(await andromeda.getAddress());
    requestId = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "address", "uint256"],
        [ethers.ZeroHash, await andromeda.getAddress(), nonce]
      )
    );
  }
  
  // Calculer un nombre aléatoire qui donnera la rareté voulue
  let randomNumber;
  if (rarity === 0) randomNumber = 50;  // Common (0-69%)
  if (rarity === 1) randomNumber = 80;  // Rare (70-89%)
  if (rarity === 2) randomNumber = 95;  // Epic (90-97%)
  if (rarity === 3) randomNumber = 99;  // Legendary (98-99%)
  
  // Fulfiller le VRF
  const andromedaAddress = await andromeda.getAddress();
  await vrfCoordinator.fulfillRandomness(requestId, randomNumber, andromedaAddress);
  
  // Retourner le tokenId (dernier token minté)
  const balance = await andromeda.balanceOf(user.address);
  return balance - 1n; // Le tokenId du dernier token
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