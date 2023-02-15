// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

import "../MintableToken.sol";

/**
 * @title TestUpgradeMintableToken
 * @dev This is a dummy contract used to test the upgrade of MintableToken
 */

contract TestUpgradeMintableToken is MintableToken {
    uint public newVar;

    event TestUpgradeMintableTokenPaused();

    function setNewVar(uint newNumber) external {
        newVar = newNumber;
    }

    function symbol() public pure override returns (string memory) {
        return "TUMT";
    }

    function name() public pure override returns (string memory) {
        return "Test Upgrade Mintable Token";
    }

    function hello() public pure returns (string memory) {
        return "HELLO";
    }

    function doubleTotalSupply() public view returns (uint256) {
        return super.totalSupply() * 2;
    }

    function balanceOf(address user) public view override returns (uint256) {
        return super.balanceOf(user) * 2;
    }

    function pause()
        external
        virtual
        override
        onlyRole(RoleManaged.PAUSER_ROLE)
    {
        emit TestUpgradeMintableTokenPaused();
        _pause();
    }
}
