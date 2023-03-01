// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableMapUpgradeable.sol";

import "./errorCoded.sol";
import "./roleManaged.sol";

/**
 * @title Restrictable
 * @dev Restrictable allows accounts to be transfer restricted
 * preventing them from sending or receiving tokens
 */

contract Restrictable is
    Initializable,
    AccessControlEnumerableUpgradeable,
    PausableUpgradeable,
    ERC20Upgradeable
{
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    //mapping an address to the transfer restriction list
    EnumerableSetUpgradeable.AddressSet private restricted;

    function __Restrictable_init() internal onlyInitializing {}

    function __Restrictable_init_unchained() internal onlyInitializing {}

    /**
     * @dev Emitted when an account is added to, or removed from the transfer restriction list
     */
    event TransferRestrictionImposed(address indexed account);
    event TransferRestrictionRemoved(address indexed account);

    modifier whenNotRestricted(address actionAccount) {
        require(
            !(isTransferRestrictionImposed(actionAccount)),
            ErrorCoded.ERR_TRANSFER_RESTRICTED
        );
        _;
    }

    /**
     * @dev Unpauses the contract
     *
     * @notice Only the admin will be able to unpause the contract
     */
    function unpause() external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev When paused, most functions of the contract will be unusable until the contract is unpaused
     *
     * @notice Only pausers can use the `pause` function
     */
    function pause() external virtual onlyRole(RoleManaged.PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Restricts `restrictedAddress` from making token transfers
     *
     * @param restrictedAddress address of account to add to the transfer restriction list
     *
     * @notice Only token transfer controllers can use the `restrictTransfers` function
     */
    function restrictTransfers(
        address restrictedAddress
    ) external virtual onlyRole(RoleManaged.TOKEN_TRANSFER_CONTROLLER_ROLE) {
        require(
            restrictedAddress != address(0),
            ErrorCoded.ERR_TRANSFER_RESTRICTION_INVALID
        );
        bool success = EnumerableSetUpgradeable.add(
            restricted,
            restrictedAddress
        );
        require(success, ErrorCoded.ERR_RESTRICT_TRANSFERS_ADD);
        emit TransferRestrictionImposed(restrictedAddress);
    }

    /**
     * @dev Unrestricts `restrictedAddress` allowing them to make transfers again
     *
     * @param restrictedAddress address to be removed from the transfer restriction list
     *
     * @notice Only token transfer controllers can use the `unrestrictTransfers` function
     */
    function unrestrictTransfers(
        address restrictedAddress
    ) external virtual onlyRole(RoleManaged.TOKEN_TRANSFER_CONTROLLER_ROLE) {
        bool success = EnumerableSetUpgradeable.remove(
            restricted,
            restrictedAddress
        );
        require(success, ErrorCoded.ERR_RESTRICT_TRANSFERS_REMOVE);
        emit TransferRestrictionRemoved(restrictedAddress);
    }

    /**
     * @dev Verifies if an address is on the transfer restriction list
     *
     * @param account address for which we are checking transferability
     */
    function isTransferRestrictionImposed(
        address account
    ) public view virtual returns (bool) {
        return EnumerableSetUpgradeable.contains(restricted, account);
    }

    /**
     * @dev Finds transfer restricted address by index
     *
     * @param index index in the transfer restriction list to fetch
     */
    function getTransferRestriction(
        uint256 index
    ) external view virtual returns (address) {
        return EnumerableSetUpgradeable.at(restricted, index);
    }

    /**
     * @dev Find number of transfer restricted addresses
     */
    function getTransferRestrictionCount()
        external
        view
        virtual
        returns (uint256)
    {
        return EnumerableSetUpgradeable.length(restricted);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
