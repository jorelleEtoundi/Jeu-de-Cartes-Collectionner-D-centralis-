const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { mintCardWithRarity, increaseTime } = require("./helpers/testHelper");

describe("Exchange Tests", function () {
  let andromeda, linkToken, vrfCoordinator;
  let owner, user1, user2;
  const COOLDOWN = 5 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MockLINK = await ethers.getContractFactory("MockLINK");
    linkToken = await MockLINK.deploy();
    await linkToken.waitForDeployment();

    const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
    vrfCoordinator = await MockVRFCoordinator.deploy();
    await vrfCoordinator.waitForDeployment();

    const Andromeda = await ethers.getContractFactory("AndromedaProtocol");
    andromeda = await Andromeda.deploy(
      await vrfCoordinator.getAddress(),
      await linkToken.getAddress(),
      ethers.ZeroHash
    );
    await andromeda.waitForDeployment();

    const contractAddress = await andromeda.getAddress();
    await linkToken.transfer(contractAddress, ethers.parseEther("100"));
  });

  describe("exchange()", function () {
    it("Should exchange cards of same rarity successfully", async function () {
      // Mint 2 Common cards for user1 and user2
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      
      const tokenId1 = 0; // user1's card
      const tokenId2 = 1; // user2's card
      
      // Wait for cooldown
      await increaseTime(COOLDOWN + 1);
      
      // Perform exchange
      await andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2);
      
      // Verify ownership switched
      expect(await andromeda.ownerOf(tokenId1)).to.equal(user2.address);
      expect(await andromeda.ownerOf(tokenId2)).to.equal(user1.address);
    });

    it("Should fail if raretys are different", async function () {
      // Mint Common for user1, Rare for user2
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1"); // Common
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 1, "QmHash2"); // Rare
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0; // Common
      const tokenId2 = 1; // Rare
      
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.revertedWith("Cards must have same rarity");
    });

    it("Should fail if card is locked", async function () {
      // Mint Rare cards (locked) for both users
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); // Rare (locked)
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 1, "QmHash2"); // Rare (locked)
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      // Try to exchange while locked (will fail on either card being locked)
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.reverted; // Accept any revert
    });

    it("Should fail if caller is not owner of card", async function () {
      // Mint cards
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0; // owned by user1
      const tokenId2 = 1; // owned by user2
      
      // user2 tries to exchange user1's card
      await expect(
        andromeda.connect(user2).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.revertedWith("Not your card");
    });

    it("Should fail if cooldown is active", async function () {
      // Mint cards
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      
      // user1 fait une autre transaction pour activer son cooldown
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      // Maintenant user1 a un cooldown actif
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should update previousOwners array", async function () {
      // Mint cards
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      // Exchange cards
      await andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2);
      
      // Get card info
      const card1 = await andromeda.getCard(tokenId1);
      const card2 = await andromeda.getCard(tokenId2);
      
      // Verify previousOwners includes original owners
      expect(card1.previousOwners).to.include(user1.address);
      expect(card2.previousOwners).to.include(user2.address);
    });

    it("Should update lastTransferAt timestamp", async function () {
      // Mint cards
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      const beforeTimestamp = await time.latest();
      
      await andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2);
      
      const card1 = await andromeda.getCard(tokenId1);
      const card2 = await andromeda.getCard(tokenId2);
      
      expect(card1.lastTransferAt).to.be.gte(beforeTimestamp);
      expect(card2.lastTransferAt).to.be.gte(beforeTimestamp);
    });

    it("Should emit CardsExchanged event", async function () {
      // Mint cards
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2)
      )
        .to.emit(andromeda, "CardsExchanged")
        .withArgs(tokenId1, tokenId2, user1.address);
    });

    it("Should fail when exchanging with yourself", async function () {
      // Mint 2 cards for user1
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user1.address, tokenId2)
      ).to.be.revertedWith("Cannot exchange with yourself");
    });
  });
});