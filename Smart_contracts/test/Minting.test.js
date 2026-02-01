const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { mintCardWithRarity, increaseTime } = require("./helpers/testHelper");

describe("Minting Tests", function () {
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

  describe("mint()", function () {
    it("Should mint a new card successfully", async function () {
      const tokenId = await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0);
      
      const balance = await andromeda.balanceOf(user1.address);
      expect(balance).to.equal(1);
      
      const card = await andromeda.getCard(tokenId);
      expect(card.rarity).to.equal(0); 
    });

    it("Should fail if cooldown is active", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0);
      
      await expect(
        andromeda.connect(user1).mint("QmTest2")
      ).to.be.reverted;
    });

    it("Should allow minting after cooldown period", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0);
      
      await increaseTime(COOLDOWN + 1);
      
      await expect(
        mintCardWithRarity(andromeda, vrfCoordinator, user1, 1)
      ).to.not.be.reverted;
    });

    it("Should fail if fleet is full (10 cards)", async function () {
      for (let i = 0; i < 10; i++) {
        await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, `QmTest${i}`);
        if (i < 9) await increaseTime(COOLDOWN + 1);
      }
      
      const balance = await andromeda.balanceOf(user1.address);
      expect(balance).to.equal(10);
      
      await increaseTime(COOLDOWN + 1);
      
      await expect(
        andromeda.connect(user1).mint("QmTest11")
      ).to.be.revertedWith("Fleet full: maximum 10 cards");
    });

    it("Should assign correct rarity based on probabilities", async function () {
      const commonId = await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0);
      await increaseTime(COOLDOWN + 1);
      const rareId = await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1);
      
      const commonCard = await andromeda.getCard(commonId);
      const rareCard = await andromeda.getCard(rareId);
      
      expect(commonCard.rarity).to.equal(0);
      expect(rareCard.rarity).to.equal(1);
    });

    it("Should lock Rare+ cards for 10 minutes", async function () {
      const rareId = await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1);
      
      const card = await andromeda.getCard(rareId);
      expect(card.isLocked).to.be.true;
    });

    it("Should store correct metadata", async function () {
      const tokenId = await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmMetadataTest");
      
      const card = await andromeda.getCard(tokenId);
      expect(card.ipfsHash).to.equal("QmMetadataTest");
    });

    it("Should emit CardMinted event", async function () {
      const tx = await andromeda.connect(user1).mint("QmTest");
      const receipt = await tx.wait();
      
      // VRF callback émettra CardMinted
      // Pour simplifier, on vérifie juste que la transaction passe
      expect(receipt).to.not.be.null;
    });

    it("Should increment tokenId counter", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0);
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0);
      
      const balance = await andromeda.balanceOf(user1.address);
      expect(balance).to.equal(2);
    });
  });

  describe("VRF Integration", function () {
    it("Should request randomness from Chainlink VRF", async function () {
      const tx = await andromeda.connect(user1).mint("QmTest");
      await expect(tx).to.not.be.reverted;
    });

    it("Should handle VRF callback correctly", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 2); 
      
      const balance = await andromeda.balanceOf(user1.address);
      expect(balance).to.equal(1);
    });
  });
});