const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mintCardWithRarity, increaseTime } = require("./helpers/testHelper");

describe("Coverage Tests", function () {
  let andromeda, linkToken, vrfCoordinator;
  let owner, user1, user2, user3;
  const COOLDOWN = 5 * 60;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

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

  describe("getUserCards()", function () {
    it("Should return empty array for user with no cards", async function () {
      const cards = await andromeda.getUserCards(user1.address);
      expect(cards.length).to.equal(0);
    });

    it("Should return all token IDs owned by user", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash3");

      const cards = await andromeda.getUserCards(user1.address);
      expect(cards.length).to.equal(3);
      expect(cards[0]).to.equal(0);
      expect(cards[1]).to.equal(1);
      expect(cards[2]).to.equal(2);
    });

    it("Should update after exchange", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);

      await andromeda.connect(user1).exchange(0, user2.address, 1);

      const user1Cards = await andromeda.getUserCards(user1.address);
      const user2Cards = await andromeda.getUserCards(user2.address);

      expect(user1Cards.length).to.equal(1);
      expect(user1Cards[0]).to.equal(1);
      expect(user2Cards.length).to.equal(1);
      expect(user2Cards[0]).to.equal(0);
    });
  });

  describe("tokenURI()", function () {
    it("Should return correct IPFS URI", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmTestHashURI");

      const uri = await andromeda.tokenURI(0);
      expect(uri).to.equal("ipfs://QmTestHashURI");
    });

    it("Should revert for non-existent token", async function () {
      await expect(
        andromeda.tokenURI(999)
      ).to.be.revertedWith("Token does not exist");
    });
  });

  describe("supportsInterface()", function () {
    it("Should support ERC721 interface", async function () {
      const supports = await andromeda.supportsInterface("0x80ac58cd");
      expect(supports).to.be.true;
    });

    it("Should support ERC721Enumerable interface", async function () {
      const supports = await andromeda.supportsInterface("0x780e9d63");
      expect(supports).to.be.true;
    });

    it("Should not support random interface", async function () {
      const supports = await andromeda.supportsInterface("0x12345678");
      expect(supports).to.be.false;
    });
  });

  describe("mint() - LINK balance", function () {
    it("Should revert if contract has no LINK", async function () {
      const Andromeda = await ethers.getContractFactory("AndromedaProtocol");
      const noLinkContract = await Andromeda.deploy(
        await vrfCoordinator.getAddress(),
        await linkToken.getAddress(),
        ethers.ZeroHash
      );
      await noLinkContract.waitForDeployment();

      await expect(
        noLinkContract.connect(user1).mint("QmTest")
      ).to.be.revertedWith("Not enough LINK");
    });
  });

  describe("exchange() - edge cases", function () {
    it("Should revert if otherOwner does not actually own otherTokenId", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmHash1");
      await increaseTime(COOLDOWN + 1);
      await mintCardWithRarity(andromeda, vrfCoordinator, user2, 0, "QmHash2");
      await increaseTime(COOLDOWN + 1);

      await expect(
        andromeda.connect(user1).exchange(0, user3.address, 1)
      ).to.be.revertedWith("Invalid other card owner");
    });
  });

  describe("getCard() - edge cases", function () {
    it("Should revert for non-existent card", async function () {
      await expect(
        andromeda.getCard(999)
      ).to.be.revertedWith("Card does not exist");
    });

    it("Should return correct card data after mint", async function () {
      await mintCardWithRarity(andromeda, vrfCoordinator, user1, 0, "QmFullData");

      const card = await andromeda.getCard(0);
      expect(card.rarity).to.equal(0);
      expect(card.value).to.equal(100);
      expect(card.ipfsHash).to.equal("QmFullData");
      expect(card.previousOwners.length).to.equal(0);
      expect(card.createdAt).to.be.gt(0);
      expect(card.lastTransferAt).to.equal(card.createdAt);
    });
  });
});
