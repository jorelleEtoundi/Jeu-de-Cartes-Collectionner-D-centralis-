// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    function requestRandomness(
        bytes32 keyHash,
        uint256 fee
    ) external returns (bytes32 requestId) {
        requestId = keccak256(abi.encodePacked(keyHash, msg.sender, nonce));
        nonce++;
        
        requestIdToRequester[requestId] = msg.sender;
        
        emit RandomnessRequest(keyHash, 0, requestId, msg.sender, fee);
        
        return requestId;
    }
    
    /**
     * @dev Manually fulfill randomness for testing
     */
    function fulfillRandomness(
        bytes32 requestId,
        uint256 randomness,
        address consumer
    ) external {
        // Call the consumer's fulfillRandomness function
        (bool success,) = consumer.call(
            abi.encodeWithSignature(
                "rawFulfillRandomness(bytes32,uint256)",
                requestId,
                randomness
            )
        );
        require(success, "Callback failed");
    }
}