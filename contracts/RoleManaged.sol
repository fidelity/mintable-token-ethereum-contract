// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

/**
 * @title RoleManaged
 * @dev RoleManaged defines account role identifiers
 */

library RoleManaged {
    /**
     * @dev
     *  DEFAULT_ADMIN_ROLE: Modify role entitlements, and unpause the contract
     *  UPGRADER_ROLE: Upgrade the contract
     *  MINTER_ROLE: Mint (to any address except those on transfer restriction list)
     *               Burn (only tokens owned by minter, or for which the minter is an approved spender)
     *  MINTER_ALLOCATOR_ROLE: Increase or decrease mint allocation assigned to minters
     *  TOKEN_TRANSFER_CONTROLLER_ROLE: Add and remove addresses from the transfer restriction list
     *  PAUSER_ROLE: Pause
     */

    // DEFAULT ADMIN_ROLE is inherited from OpenZeppelin AccessControlUpgradeable
    // See https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.8.1/contracts/access/AccessControlUpgradeable.sol#L63
    // DEFAULT_ADMIN_ROLE: 0x0000000000000000000000000000000000000000000000000000000000000000

    // UPGRADER_ROLE: 0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // MINT_ALLOCATOR_ROLE: 0x0cecf1b455fc79891fde338087a5bc58cc780c12baea2fdc499814ec6b42206a
    bytes32 public constant MINT_ALLOCATOR_ROLE =
        keccak256("MINT_ALLOCATOR_ROLE");

    // MINTER_ROLE: 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // TOKEN_TRANSFER_CONTROLLER_ROLE: 0xfacce159e6968cd08fd9a4077ce70318710e6a3e2ca966e7a450e0609027b94e
    bytes32 public constant TOKEN_TRANSFER_CONTROLLER_ROLE =
        keccak256("TOKEN_TRANSFER_CONTROLLER_ROLE");

    // PAUSER_ROLE: 0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
}
