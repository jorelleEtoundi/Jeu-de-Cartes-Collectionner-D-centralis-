// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAndromedaProtocol
 * @dev Interface for the Andromeda Protocol smart contract
 */
interface IAndromedaProtocol {
    
    // ========== ENUMS ==========
    
    enum Rarity { Common, Rare, Epic, Legendary }
    enum Race { Humans, Zephyrs, Kraths, Preservers, Synthetics, Aquarians, Ancients }
    
    // ========== STRUCTS ==========
    
    struct Card {
        string name;
        Race race;
        Rarity rarity;
        uint256 value;
        string ipfsHash;
        address[] previousOwners;
        uint256 createdAt;
        uint256 lastTransferAt;
        bool isLocked;
        uint256 lockUntil;
    }
    
    // ========== EVENTS ==========
    
    event CardMinted(uint256 indexed tokenId, address indexed owner, Race race, Rarity rarity);
    event CardsExchanged(uint256 indexed token1, uint256 indexed token2, address indexed initiator);
    event CardsFused(uint256[] burnedTokens, uint256 indexed newTokenId, Rarity newRarity);
    event CardLocked(uint256 indexed tokenId, uint256 lockUntil);
    event CardUnlocked(uint256 indexed tokenId);
    
    // ========== FUNCTIONS ==========
    
    function mint(string memory _ipfsHash) external returns (bytes32 requestId);
    
    function exchange(
        uint256 myTokenId,
        address otherOwner,
        uint256 otherTokenId
    ) external;
    
    function fuse(
        uint256[3] calldata tokenIds,
        string memory _ipfsHash
    ) external returns (uint256);
    
    function canTransact(address user) external view returns (bool);
    
    function isCardLocked(uint256 tokenId) external view returns (bool);
    
    function getCard(uint256 tokenId) external view returns (Card memory);
    
    function getUserCards(address user) external view returns (uint256[] memory);
}
