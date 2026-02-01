const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { mintCardWithRarity, increaseTime } = require("./helpers/testHelper");

describe("Fusion Tests", function () {
  let andromeda, linkToken, vrfCoordinator;
  let owner, user1, user2;
  const COOLDOWN = 5 * 60;
  const LOCK_DURATION = 10 * 60;

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

  describe("fuse()", function () {
    it("Should fuse 3 Common cards into 1 Rare card", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);

      const tokenIds = [0, 1, 2];
      const balanceBefore = await andromeda.balanceOf(user1.address);
      
      await andromeda.connect(user1).fuse(tokenIds, "QmNewHash");
      const balanceAfter = await andromeda.balanceOf(user1.address);
      expect(balanceAfter).to.equal(balanceBefore - 2n);
      
      const newTokenId = 3;
      const newCard = await andromeda.getCard(newTokenId);
      expect(newCard.rarity).to.equal(1); 
    });

    it("Should fuse 3 Rare cards into 1 Epic card", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash3");
      await increaseTime(LOCK_DURATION + 1);
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmEpicHash");
      
      const newCard = await andromeda.getCard(3);
      expect(newCard.rarity).to.equal(2); 
    });

    it("Should fuse 3 Epic cards into 1 Legendary card", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 2, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 2, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 2, "QmHash3");
      await increaseTime(LOCK_DURATION + 1);
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmLegendaryHash");
      
      const newCard = await andromeda.getCard(3);
      expect(newCard.rarity).to.equal(3); 
    });

    it("Should fail if cards have different rarities", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1"); 
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash2"); 
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash3"); 
      await increaseTime(LOCK_DURATION + 1);
      
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(user1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("All cards must have same rarity");
    });

    it("Should fail when trying to fuse Legendary cards", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 3, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 3, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 3, "QmHash3");
      await increaseTime(LOCK_DURATION + 1);
      
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(user1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Cannot fuse Legendary cards");
    });

    it("Should fail if not all cards are owned by caller", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(user1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Not all your cards");
    });

    it("Should fail if any card is locked", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 1, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(user1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Card is locked");
    });

    it("Should burn the 3 original cards", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmHash");
      
      for (let tokenId of tokenIds) {
        await expect(
          andromeda.getCard(tokenId)
        ).to.be.revertedWith("Card does not exist");
      }
    });

    it("Should lock the new fused card for 10 minutes", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmHash");
      
      const timestamp = await time.latest();
      const newCard = await andromeda.getCard(3);
      
      expect(newCard.isLocked).to.be.true;
      expect(newCard.lockUntil).to.be.gte(timestamp);
    });

    it("Should emit CardsFused event", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(user1).fuse(tokenIds, "QmHash")
      ).to.emit(andromeda, "CardsFused");
    });

    it("Should emit CardLocked event for new card", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(user1).fuse(tokenIds, "QmHash")
      ).to.emit(andromeda, "CardLocked");
    });

    it("Should update cooldown timestamp", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmHash");
      
      const canTransact = await andromeda.canTransact(user1.address);
      expect(canTransact).to.be.false;
      await increaseTime(COOLDOWN + 1);
      
      const canTransactAfter = await andromeda.canTransact(user1.address);
      expect(canTransactAfter).to.be.true;
    });

    it("Should assign correct value to fused card", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");
      await increaseTime(COOLDOWN + 1);
      
      const tokenIds = [0, 1, 2];
      await andromeda.connect(user1).fuse(tokenIds, "QmHash");
      
      const newCard = await andromeda.getCard(3);
      expect(newCard.value).to.equal(300);
    });
  });
});