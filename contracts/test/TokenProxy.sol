// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @title TokenProxy
 * @dev A simple dummy contract that forwards its tokens if any user asks it to
 */

contract TokenProxy {
    IERC20Upgradeable immutable token;

    constructor(address tokenAddress) {
        token = IERC20Upgradeable(tokenAddress);
    }

    function transfer(address to, uint256 amount) public {
        token.transfer(to, amount);
    }
}
