// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "./mintAllocated.sol";

/**
 * @title SafeAccessControlEnumerableUpgradeable
 * @dev SafeAccessControlEnumerableUpgradeable adds role-specific logic
 * to the AccessControlEnumerableUpgradeable contract to ensure that
 * mint allocations are set back to 0 when a Minter role is revoked
 * and controls to ensure the contract always has at least one admin
 */

contract SafeAccessControlEnumerableUpgradeable is
    Initializable,
    AccessControlEnumerableUpgradeable,
    ERC20Upgradeable,
    MintAllocated
{
    function __SafeAccessControlEnumerableUpgradeable_init()
        internal
        onlyInitializing
    {}

    function __SafeAccessControlEnumerableUpgradeable_init_unchained()
        internal
        onlyInitializing
    {}

    /**
     * @dev Revokes `role` from `account`
     *
     * @param role bytes32 of the role to revoke
     * @param account address to remove from role list
     */
    function revokeRole(
        bytes32 role,
        address account
    ) external virtual override {
        _safeRevokeRenounce(role, account);
        super.revokeRole(role, account);
    }

    /**
     * @dev An account revokes `role` from its own address
     *
     * @param role bytes32 of the role to renounce
     * @param account address to remove from role list
     */
    function renounceRole(
        bytes32 role,
        address account
    ) public virtual override {
        _safeRevokeRenounce(role, account);
        super.renounceRole(role, account);
    }

    /**
     * @dev Checks if role being revoked or renounced is a Minter or Default Admin
     *
     * @param role bytes32 of the role to renounce
     * @param account address to remove from role list
     *
     * @notice We restrict revoke or renounce of a role for the last Default Admin Role account
     * note that this is implicitly true because we don't allow an admin to revoke their own role
     * @notice We set Mint Allocation to 0 if we revoke or renounce Minter Role
     */
    function _safeRevokeRenounce(bytes32 role, address account) internal {
        require(hasRole(role, account), ErrorCoded.ERR_USER_DOES_NOT_HAVE_ROLE);
        if (role == RoleManaged.MINTER_ROLE) {
            unchecked {
                mintAllocation[account] = 0;
            }
            emit MintAllocationChanged(
                _msgSender(),
                account,
                mintAllocation[account]
            );
        }

        // Admin is not allowed to revoke its own role. This is to prevent accidental
        // loss of control of the contract
        if (role == DEFAULT_ADMIN_ROLE) {
            require(
                _msgSender() != account,
                ErrorCoded.ERR_DEFAULT_ADMIN_CANNOT_RENOUNCE
            );
            require(
                getRoleMemberCount(DEFAULT_ADMIN_ROLE) > 1,
                ErrorCoded.ERR_CANNOT_REVOKE_LAST_DEFAULT_ADMIN
            );
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
