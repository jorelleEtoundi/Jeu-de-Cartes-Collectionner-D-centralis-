// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RandomnessLib
 * @dev Library for handling randomness with Chainlink VRF
 * @notice Provides utility functions for generating random values for cards
 */
library RandomnessLib {
    
    /**
     * @notice Generate a random rarity based on configured probabilities
     * @dev Uses the full random number to determine rarity
     * @param randomness Random number from Chainlink VRF
     * @return rarity The generated rarity (0-3 for Common-Legendary)
     */
    function getRarityFromRandom(uint256 randomness) internal pure returns (uint8 rarity) {
        uint256 roll = randomness % 100;
        
        // 70% Common (0-69)
        if (roll < 70) return 0;
        
        // 20% Rare (70-89)
        if (roll < 90) return 1;
        
        // 8% Epic (90-97)
        if (roll < 98) return 2;
        
        // 2% Legendary (98-99)
        return 3;
    }
    
    /**
     * @notice Generate a random race (0-6 for the 7 races)
     * @param randomness Random number from Chainlink VRF
     * @return race The generated race
     */
    function getRaceFromRandom(uint256 randomness) internal pure returns (uint8 race) {
        return uint8(randomness % 7);
    }
    
    /**
     * @notice Extract multiple random values from a single random number
     * @dev Uses different parts of the random number for different attributes
     * @param randomness Random number from Chainlink VRF
     * @return rarity The rarity value
     * @return race The race value
     */
    function extractRandomAttributes(uint256 randomness) 
        internal 
        pure 
        returns (uint8 rarity, uint8 race) 
    {
        // Use lower bits for rarity
        rarity = getRarityFromRandom(randomness);
        
        // Use higher bits for race
        race = getRaceFromRandom(randomness >> 8);
    }
    
    /**
     * @notice Verify that a random number falls within expected distribution
     * @dev Helper function for testing
     * @param randomness Random number to verify
     * @param expectedMin Minimum expected value
     * @param expectedMax Maximum expected value
     * @return valid Whether the number is in range
     */
    function verifyRandomRange(
        uint256 randomness,
        uint256 expectedMin,
        uint256 expectedMax
    ) internal pure returns (bool valid) {
        return randomness >= expectedMin && randomness <= expectedMax;
    }
}
