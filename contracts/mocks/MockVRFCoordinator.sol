// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";

/**
 * @title MockVRFCoordinator
 * @dev Mock Chainlink VRF Coordinator for testing
 */
contract MockVRFCoordinator {
    uint256 private nonce;
    
    mapping(bytes32 => address) public requestIdToRequester;
    
    event RandomnessRequest(
        bytes32 indexed keyHash,
        uint256 seed,
        bytes32 indexed requestId,
        address indexed sender,
        uint256 fee
    );
    
    /**
     * @dev Mock the requestRandomness function
     */
    function onTokenTransfer(
        address sender,
        uint256 fee,
        bytes calldata data
    ) external {
        // Decode the data to get keyHash
        (bytes32 keyHash, uint256 seed) = abi.decode(data, (bytes32, uint256));
        
        bytes32 requestId = keccak256(abi.encodePacked(keyHash, sender, nonce, seed));
        nonce++;
        
        requestIdToRequester[requestId] = sender;
        
        emit RandomnessRequest(keyHash, seed, requestId, sender, fee);
    }
    
    /**
     * @dev Manually fulfill randomness for testing
     */
    function fulfillRandomness(
        bytes32 requestId,
        uint256 randomness,
        address consumer
    ) external {
        // Call rawFulfillRandomness on the consumer
        VRFConsumerBase(consumer).rawFulfillRandomness(requestId, randomness);
    }
    
    /**
     * @dev Helper to calculate request price (always returns 0 for testing)
     */
    function getRequestPrice() external pure returns (uint256) {
        return 0;
    }
}