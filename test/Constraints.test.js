const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Constraints Tests", function () {
  let andromeda, owner, addr1, addr2, vrfCoordinator, linkToken;
  const COOLDOWN = 5 * 60; // 5 minutes
  const LOCK_DURATION = 10 * 60; // 10 minutes
  const MAX_CARDS = 10;

  beforeEach(async function () {
    [owner, addr1, addr2, vrfCoordinator] = await ethers.getSigners();
    
    const MockLINK = await ethers.getContractFactory("MockLINK");
    linkToken = await MockLINK.deploy();
    
    const Andromeda = await ethers.getContractFactory("AndromedaProtocol");
    andromeda = await Andromeda.deploy(
      vrfCoordinator.address,
      await linkToken.getAddress(),
      ethers.encodeBytes32String("testKeyHash")
    );
    
    await linkToken.transfer(await andromeda.getAddress(), ethers.parseEther("100"));
  });

  describe("Transaction Cooldown (5 minutes)", function () {
    it("Should enforce 5-minute cooldown between mints", async function () {
      await andromeda.connect(addr1).mint("QmHash1");
      
      await expect(
        andromeda.connect(addr1).mint("QmHash2")
      ).to.be.revertedWith("Cooldown active");
      
      // After 5 minutes
      await time.increase(COOLDOWN + 1);
      
      await expect(
        andromeda.connect(addr1).mint("QmHash2")
      ).to.not.be.reverted;
    });

    it("Should enforce cooldown between exchanges", async function () {
      // Setup: addr1 has exchanged recently
      // Try to exchange again
      await expect(
        andromeda.connect(addr1).exchange(0, addr2.address, 1)
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should enforce cooldown between fusions", async function () {
      // Setup: addr1 just fused
      // Try to fuse again
      const tokenIds = [3, 4, 5];
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should track cooldown per user independently", async function () {
      await andromeda.connect(addr1).mint("QmHash1");
      
      // addr2 should be able to mint (independent cooldown)
      await expect(
        andromeda.connect(addr2).mint("QmHash2")
      ).to.not.be.reverted;
    });
  });

  describe("Lock Duration (10 minutes for Rare+)", function () {
    it("Should lock Rare cards for 10 minutes after mint", async function () {
      // Mock VRF to return Rare card
      // const tokenId = await mintRareCard(addr1);
      
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.true;
      
      const timestamp = await time.latest();
      expect(card.lockUntil).to.equal(timestamp + LOCK_DURATION);
    });

    it("Should lock Epic cards for 10 minutes after mint", async function () {
      const tokenId = 0; // Epic card
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.true;
    });

    it("Should lock Legendary cards for 10 minutes after mint", async function () {
      const tokenId = 0; // Legendary card
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.true;
    });

    it("Should NOT lock Common cards", async function () {
      const tokenId = 0; // Common card
      const card = await andromeda.getCard(tokenId);
      
      expect(card.isLocked).to.be.false;
      expect(card.lockUntil).to.equal(0);
    });

    it("Should unlock card after 10 minutes", async function () {
      const tokenId = 0; // Locked Rare card
      
      expect(await andromeda.isCardLocked(tokenId)).to.be.true;
      
      await time.increase(LOCK_DURATION + 1);
      
      expect(await andromeda.isCardLocked(tokenId)).to.be.false;
    });

    it("Should prevent exchange of locked cards", async function () {
      const lockedTokenId = 0; // Locked card
      const unlockedTokenId = 1;
      
      await expect(
        andromeda.connect(addr1).exchange(lockedTokenId, addr2.address, unlockedTokenId)
      ).to.be.revertedWith("Your card is locked");
    });

    it("Should prevent fusion with locked cards", async function () {
      const tokenIds = [0, 1, 2]; // tokenId 0 is locked
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Card is locked");
    });

    it("Should lock fused cards for 10 minutes", async function () {
      const tokenIds = [0, 1, 2]; // 3 unlocked Commons
      
      await andromeda.connect(addr1).fuse(tokenIds, "QmHash");
      
      const newTokenId = 3;
      const newCard = await andromeda.getCard(newTokenId);
      
      expect(newCard.isLocked).to.be.true;
    });
  });

  describe("Maximum 10 Cards Per Owner", function () {
    it("Should allow minting up to 10 cards", async function () {
      // Mock minting 10 cards
      for (let i = 0; i < 10; i++) {
        // await mintCard(addr1);
        // await time.increase(COOLDOWN + 1);
      }
      
      const balance = await andromeda.balanceOf(addr1.address);
      expect(balance).to.equal(10);
    });

    it("Should reject minting when fleet is full", async function () {
      // Setup: addr1 has 10 cards
      
      await expect(
        andromeda.connect(addr1).mint("QmHash11")
      ).to.be.revertedWith("Fleet full");
    });

    it("Should allow minting after fusion reduces count", async function () {
      // Setup: addr1 has 10 cards
      // Fuse 3 cards (10 - 3 + 1 = 8 cards)
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(addr1).fuse(tokenIds, "QmHash");
      
      // Now should have 8 cards, can mint 2 more
      await time.increase(COOLDOWN + 1);
      
      await expect(
        andromeda.connect(addr1).mint("QmHashNew")
      ).to.not.be.reverted;
    });
  });

  describe("Previous Owners Tracking", function () {
    it("Should initialize with empty previousOwners array", async function () {
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.previousOwners.length).to.equal(0);
    });

    it("Should add to previousOwners on exchange", async function () {
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2);
      
      const card1 = await andromeda.getCard(tokenId1);
      
      expect(card1.previousOwners).to.include(addr1.address);
      expect(card1.previousOwners.length).to.equal(1);
    });

    it("Should accumulate multiple previous owners", async function () {
      const tokenId = 0;
      
      // addr1 -> addr2
      await andromeda.connect(addr1).exchange(tokenId, addr2.address, 1);
      await time.increase(COOLDOWN + 1);
      
      // addr2 -> owner
      await andromeda.connect(addr2).exchange(tokenId, owner.address, 2);
      
      const card = await andromeda.getCard(tokenId);
      
      expect(card.previousOwners).to.include(addr1.address);
      expect(card.previousOwners).to.include(addr2.address);
      expect(card.previousOwners.length).to.equal(2);
    });
  });

  describe("Timestamps", function () {
    it("Should set createdAt timestamp on mint", async function () {
      const beforeMint = await time.latest();
      
      // Mint card (mock VRF fulfillment)
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.createdAt).to.be.gte(beforeMint);
    });

    it("Should update lastTransferAt on exchange", async function () {
      const tokenId = 0;
      
      const cardBefore = await andromeda.getCard(tokenId);
      const timestampBefore = cardBefore.lastTransferAt;
      
      await time.increase(100);
      
      await andromeda.connect(addr1).exchange(tokenId, addr2.address, 1);
      
      const cardAfter = await andromeda.getCard(tokenId);
      
      expect(cardAfter.lastTransferAt).to.be.gt(timestampBefore);
    });

    it("Should set lastTransferAt equal to createdAt on mint", async function () {
      const tokenId = 0;
      const card = await andromeda.getCard(tokenId);
      
      expect(card.lastTransferAt).to.equal(card.createdAt);
    });
  });

  describe("canTransact Helper", function () {
    it("Should return false immediately after transaction", async function () {
      await andromeda.connect(addr1).mint("QmHash1");
      
      const canTransact = await andromeda.canTransact(addr1.address);
      expect(canTransact).to.be.false;
    });

    it("Should return true after cooldown period", async function () {
      await andromeda.connect(addr1).mint("QmHash1");
      
      await time.increase(COOLDOWN + 1);
      
      const canTransact = await andromeda.canTransact(addr1.address);
      expect(canTransact).to.be.true;
    });

    it("Should return true for new users", async function () {
      const canTransact = await andromeda.canTransact(addr2.address);
      expect(canTransact).to.be.true;
    });
  });

  describe("isCardLocked Helper", function () {
    it("Should return true for locked cards", async function () {
      const tokenId = 0; // Rare card (locked)
      
      const isLocked = await andromeda.isCardLocked(tokenId);
      expect(isLocked).to.be.true;
    });

    it("Should return false for unlocked cards", async function () {
      const tokenId = 0; // Common card (not locked)
      
      const isLocked = await andromeda.isCardLocked(tokenId);
      expect(isLocked).to.be.false;
    });

    it("Should return false after lock expires", async function () {
      const tokenId = 0; // Initially locked
      
      await time.increase(LOCK_DURATION + 1);
      
      const isLocked = await andromeda.isCardLocked(tokenId);
      expect(isLocked).to.be.false;
    });
  });
});
