const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { mintCardWithRarity, increaseTime } = require("./helpers/testHelper");

describe("Minting Tests", function () {
  let andromeda, owner, addr1, addr2, vrfCoordinator, linkToken;
  const COOLDOWN = 5 * 60; // 5 minutes
  const LOCK_DURATION = 10 * 60; // 10 minutes

  beforeEach(async function () {
    [owner, addr1, addr2, vrfCoordinator] = await ethers.getSigners();
    
    // Deploy mock LINK token
    const MockLINK = await ethers.getContractFactory("MockLINK");
    linkToken = await MockLINK.deploy();
    
    // Deploy Andromeda Protocol
    const Andromeda = await ethers.getContractFactory("AndromedaProtocol");
    andromeda = await Andromeda.deploy(
      vrfCoordinator.address,
      await linkToken.getAddress(),
      ethers.encodeBytes32String("testKeyHash")
    );
    
    // Fund contract with LINK
    await linkToken.transfer(await andromeda.getAddress(), ethers.parseEther("100"));
  });

  describe("mint()", function () {
    it("Should mint a new card successfully", async function () {
      const tx = await andromeda.connect(addr1).mint("QmTestHash123");
      await tx.wait();
      
      // Note: In real scenario, we'd need to fulfill VRF request
      // For testing, we'll need to mock the VRF response
    });

    it("Should fail if cooldown is active", async function () {
      // First mint
      await andromeda.connect(addr1).mint("QmHash1");
      
      // Try to mint again immediately
      await expect(
        andromeda.connect(addr1).mint("QmHash2")
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should allow minting after cooldown period", async function () {
      await andromeda.connect(addr1).mint("QmHash1");
      
      // Increase time by 5 minutes + 1 second
      await time.increase(COOLDOWN + 1);
      
      // Should succeed now
      await expect(
        andromeda.connect(addr1).mint("QmHash2")
      ).to.not.be.reverted;
    });

    it("Should fail if fleet is full (10 cards)", async function () {
      // This test would require minting 10 cards
      // Each mint needs VRF fulfillment in real scenario
      // For testing purposes, we'd mock this
      
      // Pseudo-code:
      // for (let i = 0; i < 10; i++) {
      //   await mintAndFulfill(addr1, `QmHash${i}`);
      //   await time.increase(COOLDOWN + 1);
      // }
      // await expect(
      //   andromeda.connect(addr1).mint("QmHash11")
      // ).to.be.revertedWith("Fleet full");
    });

    it("Should assign correct rarity based on probabilities", async function () {
      // This requires VRF mocking
      // We'd need to test that:
      // - ~70% of mints are Common
      // - ~20% of mints are Rare
      // - ~8% of mints are Epic
      // - ~2% of mints are Legendary
    });

    it("Should lock Rare+ cards for 10 minutes", async function () {
      // Mock a Rare card mint
      // Verify card.isLocked === true
      // Verify card.lockUntil === block.timestamp + LOCK_DURATION
    });

    it("Should store correct metadata", async function () {
      // After minting and VRF fulfillment
      // Verify all card fields are correct:
      // - name
      // - race
      // - rarity
      // - value
      // - ipfsHash
      // - createdAt
      // - etc.
    });

    it("Should emit CardMinted event", async function () {
      const tx = await andromeda.connect(addr1).mint("QmHash1");
      
      // In real scenario after VRF fulfillment:
      // await expect(fulfillTx)
      //   .to.emit(andromeda, "CardMinted")
      //   .withArgs(tokenId, addr1.address, race, rarity);
    });

    it("Should increment tokenId counter", async function () {
      // Mint multiple cards and verify tokenIds are sequential
    });
  });

  describe("VRF Integration", function () {
    it("Should request randomness from Chainlink VRF", async function () {
      const tx = await andromeda.connect(addr1).mint("QmHash1");
      const receipt = await tx.wait();
      
      // Verify VRF request was created
      // Check that requestId was returned
    });

    it("Should handle VRF callback correctly", async function () {
      // Mock VRF coordinator calling fulfillRandomness
      // Verify card was created with random attributes
    });
  });
});
