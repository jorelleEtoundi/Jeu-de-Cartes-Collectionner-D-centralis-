const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Fusion Tests", function () {
  let andromeda, owner, addr1, addr2, vrfCoordinator, linkToken;
  const COOLDOWN = 5 * 60;
  const LOCK_DURATION = 10 * 60;

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

  describe("fuse()", function () {
    it("Should fuse 3 Common cards into 1 Rare card", async function () {
      // Setup: addr1 has 3 Common cards
      const tokenIds = [0, 1, 2]; // All Common
      
      const balanceBefore = await andromeda.balanceOf(addr1.address);
      
      // Fuse the cards
      const tx = await andromeda.connect(addr1).fuse(tokenIds, "QmNewHash");
      const receipt = await tx.wait();
      
      // Verify balance: lost 3, gained 1 = net -2
      const balanceAfter = await andromeda.balanceOf(addr1.address);
      expect(balanceAfter).to.equal(balanceBefore - 2n);
      
      // Verify new card is Rare
      const newTokenId = 3; // Assuming this is the new token
      const newCard = await andromeda.getCard(newTokenId);
      expect(newCard.rarity).to.equal(1); // Rare = 1
    });

    it("Should fuse 3 Rare cards into 1 Epic card", async function () {
      // Setup: addr1 has 3 Rare cards (tokenIds 0, 1, 2)
      const tokenIds = [0, 1, 2];
      
      await andromeda.connect(addr1).fuse(tokenIds, "QmEpicHash");
      
      const newCard = await andromeda.getCard(3);
      expect(newCard.rarity).to.equal(2); // Epic = 2
    });

    it("Should fuse 3 Epic cards into 1 Legendary card", async function () {
      // Setup: addr1 has 3 Epic cards
      const tokenIds = [0, 1, 2];
      
      await andromeda.connect(addr1).fuse(tokenIds, "QmLegendaryHash");
      
      const newCard = await andromeda.getCard(3);
      expect(newCard.rarity).to.equal(3); // Legendary = 3
    });

    it("Should fail if cards have different rarities", async function () {
      // Setup: tokenId 0 is Common, tokenIds 1,2 are Rare
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("All cards must have same rarity");
    });

    it("Should fail when trying to fuse Legendary cards", async function () {
      // Setup: addr1 has 3 Legendary cards
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Cannot fuse Legendary cards");
    });

    it("Should fail if not all cards are owned by caller", async function () {
      // Setup: tokenId 0,1 owned by addr1, tokenId 2 owned by addr2
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Not all your cards");
    });

    it("Should fail if any card is locked", async function () {
      // Setup: tokenId 0,1 unlocked, tokenId 2 locked
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      ).to.be.revertedWith("Card is locked");
    });

    it("Should burn the 3 original cards", async function () {
      const tokenIds = [0, 1, 2];
      
      await andromeda.connect(addr1).fuse(tokenIds, "QmHash");
      
      // Verify the 3 cards no longer exist
      for (let tokenId of tokenIds) {
        await expect(
          andromeda.getCard(tokenId)
        ).to.be.revertedWith("Card does not exist");
      }
    });

    it("Should lock the new fused card for 10 minutes", async function () {
      const tokenIds = [0, 1, 2];
      
      const tx = await andromeda.connect(addr1).fuse(tokenIds, "QmHash");
      const timestamp = await time.latest();
      
      const newCard = await andromeda.getCard(3);
      
      expect(newCard.isLocked).to.be.true;
      expect(newCard.lockUntil).to.equal(timestamp + LOCK_DURATION);
    });

    it("Should emit CardsFused event", async function () {
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      )
        .to.emit(andromeda, "CardsFused");
      // .withArgs(tokenIds, newTokenId, newRarity);
    });

    it("Should emit CardLocked event for new card", async function () {
      const tokenIds = [0, 1, 2];
      
      await expect(
        andromeda.connect(addr1).fuse(tokenIds, "QmHash")
      )
        .to.emit(andromeda, "CardLocked");
    });

    it("Should update cooldown timestamp", async function () {
      const tokenIds = [0, 1, 2];
      
      await andromeda.connect(addr1).fuse(tokenIds, "QmHash");
      
      const canTransact = await andromeda.canTransact(addr1.address);
      expect(canTransact).to.be.false;
      
      // After cooldown period
      await time.increase(COOLDOWN + 1);
      
      const canTransactAfter = await andromeda.canTransact(addr1.address);
      expect(canTransactAfter).to.be.true;
    });

    it("Should assign correct value to fused card", async function () {
      // Common value = 100, Rare value = 300
      const tokenIds = [0, 1, 2]; // 3 Commons
      
      await andromeda.connect(addr1).fuse(tokenIds, "QmHash");
      
      const newCard = await andromeda.getCard(3);
      expect(newCard.value).to.equal(300); // Rare value
    });
  });
});
