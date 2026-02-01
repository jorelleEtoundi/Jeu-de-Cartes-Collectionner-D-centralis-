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
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      
      const tokenId1 = 0; 
      const tokenId2 = 1; 
      await increaseTime(COOLDOWN + 1);
      await andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2);
      
      expect(await andromeda.ownerOf(tokenId1)).to.equal(user2.address);
      expect(await andromeda.ownerOf(tokenId2)).to.equal(user1.address);
    });

    it("Should fail if raretys are different", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1"); 
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 1, "QmHash2"); 
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0; 
      const tokenId2 = 1; 
      
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.revertedWith("Cards must have same rarity");
    });

    it("Should fail if card is locked", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); 
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 1, "QmHash2"); 
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.reverted; 
    });

    it("Should fail if caller is not owner of card", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0; 
      const tokenId2 = 1; 
      await expect(
        andromeda.connect(user2).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.revertedWith("Not your card");
    });

    it("Should fail if cooldown is active", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2)
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should update previousOwners array", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2);
      
      const card1 = await andromeda.getCard(tokenId1);
      const card2 = await andromeda.getCard(tokenId2);
      
      expect(card1.previousOwners).to.include(user1.address);
      expect(card2.previousOwners).to.include(user2.address);
    });

    it("Should update lastTransferAt timestamp", async function () {
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