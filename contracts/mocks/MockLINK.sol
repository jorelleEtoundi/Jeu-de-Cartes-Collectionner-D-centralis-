// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockLINK
 * @dev Mock LINK token with transferAndCall for VRF
 */
contract MockLINK is ERC20 {
    constructor() ERC20("ChainLink Token", "LINK") {
        _mint(msg.sender, 1000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    /**
     * @dev Mock transferAndCall (required by VRF)
     */
    function transferAndCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool success) {
        transfer(to, value);
        return true;
    }
}