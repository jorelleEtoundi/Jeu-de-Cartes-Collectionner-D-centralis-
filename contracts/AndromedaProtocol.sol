// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";
import "./libraries/RandomnessLib.sol";

/**
 * @title AndromedaProtocol
 * @dev Decentralized Space Card Collecting Game - NFT Smart Contract
 * @notice Manages minting, exchanging, and fusing of space cards with 7 alien races and 4 rarity levels
 */
contract AndromedaProtocol is ERC721, ERC721Enumerable, Ownable, VRFConsumerBase {
    
    // ========== ENUMS ==========
    
    /// @notice Rarity levels with their respective probabilities
    /// @dev Common: 70%, Rare: 20%, Epic: 8%, Legendary: 2%
    enum Rarity { Common, Rare, Epic, Legendary }
    
    /// @notice The seven major alien races of the Andromeda galaxy
    enum Race { Humans, Zephyrs, Kraths, Preservers, Synthetics, Aquarians, Ancients }
    
    // ========== STRUCTS ==========
    
    /// @notice Complete card data structure
    struct Card {
        string name;                    // Card name (generated based on race and rarity)
        Race race;                      // Alien race
        Rarity rarity;                  // Rarity level
        uint256 value;                  // Card value based on rarity
        string ipfsHash;                // IPFS hash for metadata and image
        address[] previousOwners;       // History of previous owners
        uint256 createdAt;              // Timestamp of creation
        uint256 lastTransferAt;         // Timestamp of last transfer
        bool isLocked;                  // Lock status (Rare+ cards locked after mint)
        uint256 lockUntil;              // Timestamp until card is locked
    }
    
    // ========== STATE VARIABLES ==========
    
    /// @notice Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @notice Mapping from token ID to Card data
    mapping(uint256 => Card) public cards;
    
    /// @notice Mapping from address to last transaction timestamp (for cooldown)
    mapping(address => uint256) public lastTransactionTime;
    
    /// @notice Chainlink VRF request tracking
    mapping(bytes32 => address) public vrfRequests;
    mapping(bytes32 => string) public pendingMintHashes;
    
    // ========== CONSTANTS ==========
    
    /// @notice Maximum cards a commander can own
    uint256 public constant MAX_CARDS_PER_OWNER = 10;
    
    /// @notice Cooldown between transactions (5 minutes)
    uint256 public constant TRANSACTION_COOLDOWN = 5 minutes;
    
    /// @notice Lock duration for Rare+ cards (10 minutes)
    uint256 public constant LOCK_DURATION = 10 minutes;
    
    /// @notice Chainlink VRF fee
    uint256 public constant VRF_FEE = 0.1 * 10**18; // 0.1 LINK
    
    /// @notice Rarity values
    mapping(Rarity => uint256) public rarityValues;
    
    // ========== CHAINLINK VRF ==========
    
    address internal vrfCoordinator;
    bytes32 internal keyHash;
    
    // ========== EVENTS ==========
    
    event CardMinted(uint256 indexed tokenId, address indexed owner, Race race, Rarity rarity);
    event CardsExchanged(uint256 indexed token1, uint256 indexed token2, address indexed initiator);
    event CardsFused(uint256[] burnedTokens, uint256 indexed newTokenId, Rarity newRarity);
    event CardLocked(uint256 indexed tokenId, uint256 lockUntil);
    event CardUnlocked(uint256 indexed tokenId);
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @notice Initialize the Andromeda Protocol
     * @param _vrfCoordinator Chainlink VRF Coordinator address
     * @param _linkToken LINK token address
     * @param _keyHash Chainlink VRF key hash
     */
    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash
    ) 
        ERC721("Andromeda Protocol", "ACARD")
        Ownable(msg.sender)
        VRFConsumerBase(_vrfCoordinator, _linkToken)
    {
        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        
        // Initialize rarity values
        rarityValues[Rarity.Common] = 100;
        rarityValues[Rarity.Rare] = 300;
        rarityValues[Rarity.Epic] = 700;
        rarityValues[Rarity.Legendary] = 1000;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @notice Mint a new card with random rarity and race
     * @dev Uses Chainlink VRF for verifiable randomness
     * @param _ipfsHash IPFS hash for card metadata
     */
    function mint(string memory _ipfsHash) external returns (bytes32 requestId) {
        require(balanceOf(msg.sender) < MAX_CARDS_PER_OWNER, "Fleet full: maximum 10 cards");
        require(
            block.timestamp >= lastTransactionTime[msg.sender] + TRANSACTION_COOLDOWN,
            "Cooldown active: wait 5 minutes between transactions"
        );
        require(LINK.balanceOf(address(this)) >= VRF_FEE, "Not enough LINK");
        
        // Request random number from Chainlink VRF
        requestId = requestRandomness(keyHash, VRF_FEE);
        vrfRequests[requestId] = msg.sender;
        pendingMintHashes[requestId] = _ipfsHash;
        
        // Update cooldown
        lastTransactionTime[msg.sender] = block.timestamp;
    }
    
    /**
     * @notice Callback function used by VRF Coordinator
     * @dev Completes the minting process with verifiable randomness
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        address minter = vrfRequests[requestId];
        require(minter != address(0), "Request not found");
        
        string memory ipfsHash = pendingMintHashes[requestId];
        
        // Generate rarity and race from randomness
        Rarity rarity = _generateRarity(randomness);
        Race race = _generateRace(randomness);
        
        // Mint the NFT
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(minter, tokenId);
        
        // Create the card
        bool shouldLock = rarity >= Rarity.Rare;
        uint256 lockTime = shouldLock ? block.timestamp + LOCK_DURATION : 0;
        
        cards[tokenId] = Card({
            name: _generateName(race, rarity),
            race: race,
            rarity: rarity,
            value: rarityValues[rarity],
            ipfsHash: ipfsHash,
            previousOwners: new address[](0),
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            isLocked: shouldLock,
            lockUntil: lockTime
        });
        
        emit CardMinted(tokenId, minter, race, rarity);
        
        if (shouldLock) {
            emit CardLocked(tokenId, lockTime);
        }
        
        // Cleanup
        delete vrfRequests[requestId];
        delete pendingMintHashes[requestId];
    }
    
    // ========== EXCHANGE FUNCTIONS ==========
    
    /**
     * @notice Exchange cards between two commanders
     * @dev Both cards must have the same rarity and not be locked
     * @param myTokenId Token ID of caller's card
     * @param otherOwner Address of the other owner
     * @param otherTokenId Token ID of other owner's card
     */
    function exchange(
        uint256 myTokenId,
        address otherOwner,
        uint256 otherTokenId
    ) external {
        require(ownerOf(myTokenId) == msg.sender, "Not your card");
        require(ownerOf(otherTokenId) == otherOwner, "Invalid other card owner");
        require(otherOwner != msg.sender, "Cannot exchange with yourself");
        
        Card storage myCard = cards[myTokenId];
        Card storage otherCard = cards[otherTokenId];
        
        require(myCard.rarity == otherCard.rarity, "Cards must have same rarity");
        require(!_isCardLocked(myTokenId), "Your card is locked");
        require(!_isCardLocked(otherTokenId), "Other card is locked");
        require(
            block.timestamp >= lastTransactionTime[msg.sender] + TRANSACTION_COOLDOWN,
            "Cooldown active"
        );
        
        // Atomic transfer
        _transfer(msg.sender, otherOwner, myTokenId);
        _transfer(otherOwner, msg.sender, otherTokenId);
        
        // Update metadata
        myCard.previousOwners.push(msg.sender);
        myCard.lastTransferAt = block.timestamp;
        
        otherCard.previousOwners.push(otherOwner);
        otherCard.lastTransferAt = block.timestamp;
        
        // Update cooldown
        lastTransactionTime[msg.sender] = block.timestamp;
        
        emit CardsExchanged(myTokenId, otherTokenId, msg.sender);
    }
    
    // ========== FUSION FUNCTIONS ==========
    
    /**
     * @notice Fuse 3 cards of same rarity to create 1 card of higher rarity
     * @dev Burns 3 cards and mints 1 new card (Common->Rare, Rare->Epic, Epic->Legendary)
     * @param tokenIds Array of 3 token IDs to fuse
     * @param _ipfsHash IPFS hash for new card metadata
     */
    function fuse(
        uint256[3] calldata tokenIds,
        string memory _ipfsHash
    ) external returns (uint256) {
        require(
            block.timestamp >= lastTransactionTime[msg.sender] + TRANSACTION_COOLDOWN,
            "Cooldown active"
        );
        
        // Verify ownership and get rarity
        Rarity rarity = cards[tokenIds[0]].rarity;
        
        for (uint256 i = 0; i < 3; i++) {
            require(ownerOf(tokenIds[i]) == msg.sender, "Not all your cards");
            require(cards[tokenIds[i]].rarity == rarity, "All cards must have same rarity");
            require(!_isCardLocked(tokenIds[i]), "Card is locked");
        }
        
        require(rarity < Rarity.Legendary, "Cannot fuse Legendary cards");
        
        // Burn the 3 cards
        for (uint256 i = 0; i < 3; i++) {
            _burn(tokenIds[i]);
        }
        
        // Create new card with higher rarity
        Rarity newRarity = Rarity(uint256(rarity) + 1);
        Race newRace = _generateRace(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))));
        
        uint256 newTokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, newTokenId);
        
        cards[newTokenId] = Card({
            name: _generateName(newRace, newRarity),
            race: newRace,
            rarity: newRarity,
            value: rarityValues[newRarity],
            ipfsHash: _ipfsHash,
            previousOwners: new address[](0),
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            isLocked: true,
            lockUntil: block.timestamp + LOCK_DURATION
        });
        
        // Update cooldown
        lastTransactionTime[msg.sender] = block.timestamp;
        
        uint256[] memory tokenIdArray = new uint256[](3);
        tokenIdArray[0] = tokenIds[0];
        tokenIdArray[1] = tokenIds[1];
        tokenIdArray[2] = tokenIds[2];
        emit CardsFused(tokenIdArray, newTokenId, newRarity);
        emit CardLocked(newTokenId, block.timestamp + LOCK_DURATION);
        
        return newTokenId;
    }
    
    // ========== UTILITY FUNCTIONS ==========
    
    /**
     * @notice Generate rarity based on random number
     * @dev 70% Common, 20% Rare, 8% Epic, 2% Legendary
     */
    function _generateRarity(uint256 randomness) internal pure returns (Rarity) {
        uint256 roll = randomness % 100;
        
        if (roll < 70) return Rarity.Common;      // 0-69: 70%
        if (roll < 90) return Rarity.Rare;        // 70-89: 20%
        if (roll < 98) return Rarity.Epic;        // 90-97: 8%
        return Rarity.Legendary;                  // 98-99: 2%
    }
    
    /**
     * @notice Generate race based on random number
     * @dev Equal probability for all 7 races
     */
    function _generateRace(uint256 randomness) internal pure returns (Race) {
        return Race(randomness % 7);
    }
    
    /**
     * @notice Generate card name based on race and rarity
     */
    function _generateName(Race race, Rarity rarity) internal pure returns (string memory) {
        string[7] memory raceNames = [
            "Human",
            "Zephyr",
            "Krath",
            "Preserver",
            "Synthetic",
            "Aquarian",
            "Ancient"
        ];
        
        string[4] memory rarityPrefixes = [
            "Scout",
            "Elite",
            "Legendary",
            "Mythic"
        ];
        
        return string(abi.encodePacked(
            rarityPrefixes[uint256(rarity)],
            " ",
            raceNames[uint256(race)],
            " Vessel"
        ));
    }
    
    /**
     * @notice Check if a card is currently locked
     */
    function _isCardLocked(uint256 tokenId) internal view returns (bool) {
        Card storage card = cards[tokenId];
        return card.isLocked && block.timestamp < card.lockUntil;
    }
    
    /**
     * @notice Check if user can transact (cooldown passed)
     */
    function canTransact(address user) external view returns (bool) {
        return block.timestamp >= lastTransactionTime[user] + TRANSACTION_COOLDOWN;
    }
    
    /**
     * @notice Check if a card is locked
     */
    function isCardLocked(uint256 tokenId) external view returns (bool) {
        return _isCardLocked(tokenId);
    }
    
    /**
     * @notice Get complete card information
     */
    function getCard(uint256 tokenId) external view returns (Card memory) {
        require(_ownerOf(tokenId) != address(0), "Card does not exist");
        return cards[tokenId];
    }
    
    /**
     * @notice Get all card IDs owned by a user
     */
    function getUserCards(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(user, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @notice Get token URI (IPFS hash)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked("ipfs://", cards[tokenId].ipfsHash));
    }
    // ========== TEST FUNCTIONS (Remove in production) ==========

    /**
    * @notice Test-only function to mint with controlled randomness
    * @dev ONLY for testing - remove before production deployment
    */
    function testMint(string memory _ipfsHash, uint256 randomness) external returns (uint256) {
        require(balanceOf(msg.sender) < MAX_CARDS_PER_OWNER, "Fleet full: maximum 10 cards");
        require(
            block.timestamp >= lastTransactionTime[msg.sender] + TRANSACTION_COOLDOWN,
            "Cooldown active: wait 5 minutes between transactions"
        );
        
        // Generate rarity and race from randomness
        Rarity rarity = _generateRarity(randomness);
        Race race = _generateRace(randomness);
        
        // Mint the NFT
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        // Create the card
        bool shouldLock = rarity >= Rarity.Rare;
        uint256 lockTime = shouldLock ? block.timestamp + LOCK_DURATION : 0;
        
        cards[tokenId] = Card({
            name: _generateName(race, rarity),
            race: race,
            rarity: rarity,
            value: rarityValues[rarity],
            ipfsHash: _ipfsHash,
            previousOwners: new address[](0),
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            isLocked: shouldLock,
            lockUntil: lockTime
        });
        
        lastTransactionTime[msg.sender] = block.timestamp;
        
        emit CardMinted(tokenId, msg.sender, race, rarity);
        
        if (shouldLock) {
            emit CardLocked(tokenId, lockTime);
        }
        
        return tokenId;
    }
    // ========== REQUIRED OVERRIDES ==========
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}