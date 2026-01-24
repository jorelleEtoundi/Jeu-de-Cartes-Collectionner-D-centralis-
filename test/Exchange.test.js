const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Exchange Tests", function () {
  let andromeda, owner, addr1, addr2, vrfCoordinator, linkToken;
  const COOLDOWN = 5 * 60;

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

  describe("exchange()", function () {
    it("Should exchange cards of same rarity successfully", async function () {
      // Setup: Both users mint cards of same rarity
      // This requires VRF mocking to ensure same rarity
      
      const tokenId1 = 0; // addr1's card
      const tokenId2 = 1; // addr2's card
      
      // Perform exchange
      // await andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2);
      
      // Verify ownership switched
      // expect(await andromeda.ownerOf(tokenId1)).to.equal(addr2.address);
      // expect(await andromeda.ownerOf(tokenId2)).to.equal(addr1.address);
    });

    it("Should fail if raretys are different", async function () {
      // Setup: addr1 has Common, addr2 has Rare
      const tokenId1 = 0; // Common
      const tokenId2 = 1; // Rare
      
      await expect(
        andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2)
      ).to.be.revertedWith("Cards must have same rarity");
    });

    it("Should fail if card is locked", async function () {
      // Setup: addr1 has a locked Rare card
      const tokenId1 = 0; // Locked card
      const tokenId2 = 1; // Unlocked card
      
      await expect(
        andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2)
      ).to.be.revertedWith("Your card is locked");
    });

    it("Should fail if caller is not owner of card", async function () {
      const tokenId1 = 0; // owned by addr1
      const tokenId2 = 1; // owned by addr2
      
      // addr2 tries to exchange addr1's card
      await expect(
        andromeda.connect(addr2).exchange(tokenId1, addr2.address, tokenId2)
      ).to.be.revertedWith("Not your card");
    });

    it("Should fail if cooldown is active", async function () {
      // addr1 just minted
      await andromeda.connect(addr1).mint("QmHash1");
      
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2)
      ).to.be.revertedWith("Cooldown active");
    });

    it("Should update previousOwners array", async function () {
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      // Exchange cards
      await andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2);
      
      // Get card info
      const card1 = await andromeda.getCard(tokenId1);
      const card2 = await andromeda.getCard(tokenId2);
      
      // Verify previousOwners includes original owners
      expect(card1.previousOwners).to.include(addr1.address);
      expect(card2.previousOwners).to.include(addr2.address);
    });

    it("Should update lastTransferAt timestamp", async function () {
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      const beforeTimestamp = await time.latest();
      
      await andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2);
      
      const card1 = await andromeda.getCard(tokenId1);
      const card2 = await andromeda.getCard(tokenId2);
      
      expect(card1.lastTransferAt).to.be.gte(beforeTimestamp);
      expect(card2.lastTransferAt).to.be.gte(beforeTimestamp);
    });

    it("Should emit CardsExchanged event", async function () {
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(addr1).exchange(tokenId1, addr2.address, tokenId2)
      )
        .to.emit(andromeda, "CardsExchanged")
        .withArgs(tokenId1, tokenId2, addr1.address);
    });

    it("Should fail when exchanging with yourself", async function () {
      const tokenId1 = 0;
      const tokenId2 = 1;
      
      await expect(
        andromeda.connect(addr1).exchange(tokenId1, addr1.address, tokenId2)
      ).to.be.revertedWith("Cannot exchange with yourself");
    });
  });
});
