const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { mintCardWithRarity, increaseTime } = require("./helpers/testHelper");

describe("Constraints Tests", function () {
  let andromeda, linkToken, vrfCoordinator;
  let owner, user1, user2;
  const COOLDOWN = 5 * 60; // 5 minutes
  const LOCK_DURATION = 10 * 60; // 10 minutes
  const MAX_CARDS = 10;

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

  describe("Transaction Cooldown (5 minutes)", function () {
    it("Should enforce 5-minute cooldown between mints", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      
      await expect(
        andromeda.connect(user1).testMint("QmHash2", 50)
      ).to.be.revertedWith("Cooldown active: wait 5 minutes between transactions");
      
      // After 5 minutes
      await increaseTime(COOLDOWN + 1);
      
      await expect(
        andromeda.connect(user1).testMint("QmHash2", 50)
      ).to.not.be.reverted;
    });

    it("Should enforce cooldown between exchanges", async function () {
      // Mint cards for both users
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      // user1 exchanges (this activates cooldown)
      await andromeda.connect(user1).exchange(0, user2.address, 1);
      
      // Mint new cards WITHOUT waiting for user1's cooldown
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash4");
      
      // Try to exchange again immediately (should fail - user1 just minted)
      await expect(
        andromeda.connect(user1).exchange(3, user2.address, 2)
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should enforce cooldown between fusions", async function () {
      // Mint 3 cards and fuse
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      await andromeda.connect(user1).fuse([0, 1, 2], "QmFused");
      
      // Mint 3 more cards for another fusion
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash4");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash5");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash6");
      
      // Try to fuse again immediately (should fail)
      await expect(
        andromeda.connect(user1).fuse([4, 5, 6], "QmFused2")
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should track cooldown per user independently", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      
      // user2 should be able to mint (independent cooldown)
      await expect(
        mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2")
      ).to.not.be.reverted;
    });
  });

  describe("Lock Duration (10 minutes for Rare+)", function () {
    it("Should lock Rare cards for 10 minutes after mint", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); // Rare
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.true;
      expect(card.lockUntil).to.be.gt(0);
    });

    it("Should lock Epic cards for 10 minutes after mint", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 2, "QmHash1"); // Epic
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.true;
    });

    it("Should lock Legendary cards for 10 minutes after mint", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 3, "QmHash1"); // Legendary
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.true;
    });

    it("Should NOT lock Common cards", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1"); // Common
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.false;
      expect(card.lockUntil).to.equal(0);
    });

    it("Should unlock card after 10 minutes", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); // Rare (locked)
      
      const tokenId = 0;
      expect(await andromeda.isCardLocked(tokenId)).to.be.true;
      
      await increaseTime(LOCK_DURATION + 1);
      
      expect(await andromeda.isCardLocked(tokenId)).to.be.false;
    });

    it("Should prevent exchange of locked cards", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); // Rare (locked)
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 1, "QmHash2"); // Rare (locked)
      await increaseTime(COOLDOWN + 1);
      
      const lockedTokenId = 0;
      const otherTokenId = 1;
      
      await expect(
        andromeda.connect(user1).exchange(lockedTokenId, user2.address, otherTokenId)
      ).to.be.reverted; // Either card locked
    });

    it("Should prevent fusion with locked cards", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); // Rare (locked)
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash2"); // Rare (locked)
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash3"); // Rare (locked)
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(user1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Card is locked");
    });

    it("Should lock fused cards for 10 minutes", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmHash");
      
      const newTokenId = 3;
      const newCard = await andromeda.getCard(newTokenId);
      
      expect(newCard.isLocked).to.be.true;
    });
  });

  describe("Maximum 10 Cards Per Owner", function () {
    it("Should allow minting up to 10 cards", async function () {
      for (let i = 0; i < 10; i++) {
        await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, `QmHash${i}`);
        if (i < 9) await increaseTime(COOLDOWN + 1);
      }
      
      const balance = await andromeda.balanceOf(user1.address);
      expect(balance).to.equal(10);
    });

    it("Should reject minting when fleet is full", async function () {
      for (let i = 0; i < 10; i++) {
        await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, `QmHash${i}`);
        if (i < 9) await increaseTime(COOLDOWN + 1);
      }
      
      await increaseTime(COOLDOWN + 1);
      
      await expect(
        andromeda.connect(user1).testMint("QmHash11", 50)
      ).to.be.revertedWith("Fleet full: maximum 10 cards");
    });

    it("Should allow minting after fusion reduces count", async function () {
      for (let i = 0; i < 10; i++) {
        await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, `QmHash${i}`);
        if (i < 9) await increaseTime(COOLDOWN + 1);
      }
      
      await increaseTime(COOLDOWN + 1);
      
      // Fuse 3 cards (10 - 3 + 1 = 8 cards)
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmFused");
      
      // Now should have 8 cards, can mint more
      await increaseTime(COOLDOWN + 1);
      
      await expect(
        mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHashNew")
      ).to.not.be.reverted;
    });
  });

  describe("Previous Owners Tracking", function () {
    it("Should initialize with empty previousOwners array", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.previousOwners.length).to.equal(0);
    });

    it("Should add to previousOwners on exchange", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await andromeda.connect(user1).exchange(tokenId1, user2.address, tokenId2);
      
      const card1 = await andromeda.getCard(tokenId1);
      
      expect(card1.previousOwners).to.include(user1.address);
      expect(card1.previousOwners.length).to.equal(1);
    });

    it("Should accumulate multiple previous owners", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, owner, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId = 0;
      
      // user1 -> user2
      await andromeda.connect(user1).exchange(tokenId, user2.address, 1);
      await increaseTime(COOLDOWN + 1);
      
      // user2 -> owner
      await andromeda.connect(user2).exchange(tokenId, owner.address, 2);
      
      const card = await andromeda.getCard(tokenId);
      
      expect(card.previousOwners).to.include(user1.address);
      expect(card.previousOwners).to.include(user2.address);
      expect(card.previousOwners.length).to.equal(2);
    });
  });

  describe("Timestamps", function () {
    it("Should set createdAt timestamp on mint", async function () {
      const beforeMint = await time.latest();
      
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.createdAt).to.be.gte(beforeMint);
    });

    it("Should update lastTransferAt on exchange", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      
      const tokenId = 0;
      const cardBefore = await andromeda.getCard(tokenId);
      const timestampBefore = cardBefore.lastTransferAt;
      
      await increaseTime(100);
      
      await andromeda.connect(user1).exchange(tokenId, user2.address, 1);
      
      const cardAfter = await andromeda.getCard(tokenId);
      
      expect(cardAfter.lastTransferAt).to.be.gt(timestampBefore);
    });

    it("Should set lastTransferAt equal to createdAt on mint", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.lastTransferAt).to.equal(card.createdAt);
    });
  });

  describe("canTransact Helper", function () {
    it("Should return false immediately after transaction", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      
      const canTransact = await andromeda.canTransact(user1.address);
      expect(canTransact).to.be.false;
    });

    it("Should return true after cooldown period", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      
      await increaseTime(COOLDOWN + 1);
      
      const canTransact = await andromeda.canTransact(user1.address);
      expect(canTransact).to.be.true;
    });

    it("Should return true for new users", async function () {
      const canTransact = await andromeda.canTransact(user2.address);
      expect(canTransact).to.be.true;
    });
  });

  describe("isCardLocked Helper", function () {
    it("Should return true for locked cards", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); // Rare (locked)
      
      const tokenId = 0;
      const isLocked = await andromeda.isCardLocked(tokenId);
      expect(isLocked).to.be.true;
    });

    it("Should return false for unlocked cards", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1"); // Common (not locked)
      
      const tokenId = 0;
      const isLocked = await andromeda.isCardLocked(tokenId);
      expect(isLocked).to.be.false;
    });

    it("Should return false after lock expires", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1"); // Rare (locked)
      
      const tokenId = 0;
      await increaseTime(LOCK_DURATION + 1);
      
      const isLocked = await andromeda.isCardLocked(tokenId);
      expect(isLocked).to.be.false;
    });
  });
});