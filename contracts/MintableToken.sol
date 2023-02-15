// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// Custom modules
import "./restrictable.sol";
import "./mintAllocated.sol";
import "./errorCoded.sol";
import "./roleManaged.sol";
import "./safeAccessControlEnumerableUpgradeable.sol";

/**
 * @title MintableToken
 * @dev MintableToken is an upgradeable ERC20 token with special provisions for minting, burning and transfer restrictions
 */

contract MintableToken is
    UUPSUpgradeable,
    Restrictable,
    MintAllocated,
    SafeAccessControlEnumerableUpgradeable
{
    using RoleManaged for bytes32;
    using ErrorCoded for string;

    /**
     * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
     * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
     * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
     * through proxies.
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the ERC20 contract with token name and symbol, and sets an address to the `DEFAULT_ADMIN_ROLE`
     *
     * @param _name the name of the token
     * @param _symbol the symbol of the token
     * @param _admin the default admin address for the token contract
     *
     * @notice Admin address must be set upon deployment. Contract deployer(_msgSender()) is not assumed to have any role.
     * @notice All other roles of the token contract must be granted in additional transactions.
     * @notice This must fail if the admin address is zero.
     */
    function initialize(
        string calldata _name,
        string calldata _symbol,
        address _admin
    ) external initializer {
        require(_admin != address(0), ErrorCoded.ERR_7);

        __ERC20_init(_name, _symbol);
        __Pausable_init();
        __UUPSUpgradeable_init();
        __Context_init();
        __SafeAccessControlEnumerableUpgradeable_init();
        __ERC165_init();
        __ERC1967Upgrade_init();
        //custom features
        __MintAllocated_init();
        __Restrictable_init();
        //RBAC
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens
     *
     * @param spender account being approved to spend the caller's tokens
     * @param amount quantity of tokens being approved to be spent
     */
    function approve(
        address spender,
        uint256 amount
    )
        public
        virtual
        override
        whenNotPaused
        whenNotRestricted(_msgSender())
        whenNotRestricted(spender)
        whenNotRestricted(tx.origin)
        returns (bool)
    {
        ERC20Upgradeable._approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller
     *
     * @param spender account being approved to spend the caller's tokens
     * @param addedValue the additional quantity of tokens being approved to be spent
     *
     * @notice This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     */
    function increaseAllowance(
        address spender,
        uint256 addedValue
    )
        public
        virtual
        override
        whenNotPaused
        whenNotRestricted(_msgSender())
        whenNotRestricted(spender)
        whenNotRestricted(tx.origin)
        returns (bool)
    {
        uint256 currentAllowance = allowance(_msgSender(), spender);
        require(
            type(uint).max - currentAllowance >= addedValue,
            ErrorCoded.ERR_11
        );
        unchecked {
            _modifyAllowance(spender, currentAllowance + addedValue);
        }
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller
     *
     * @param spender account that has been approved to spend the caller's tokens
     * @param subtractedValue the quantity of tokens to remove from the spender's approval
     *
     * @notice Spender's allowance is set to zero when the `subtractedValue` exceeds current allowance. This is allowed
     * to succeed as the caller still should be able to decrease the spender's allowance under a race condition when a
     * transfer decreases the spender's allowance.
     *
     * @notice A transfer restricted user is allowed to decrease allowances.
     * This is to prevent a compromised spender address from spending previously approved allowance immediately after the
     * restriction is lifted. No fund transfer is allowed when there is a transfer restriction.
     */
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) public virtual override whenNotPaused returns (bool) {
        uint256 currentAllowance = allowance(_msgSender(), spender);
        uint256 newAllowance = currentAllowance > subtractedValue
            ? currentAllowance - subtractedValue
            : 0;

        _modifyAllowance(spender, newAllowance);
        return true;
    }

    /**
     * @dev Moves amount tokens from `from` to `to` using the allowance mechanism. The `amount` is then deducted from the caller’s allowance
     *
     * @param from origin of transfer
     * @param to recipient of transfer
     * @param amount quantity of tokens transferred
     *
     * @notice Any address in the transfer restriction list is not allowed to transfer tokens
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override whenNotRestricted(_msgSender()) returns (bool) {
        ERC20Upgradeable._spendAllowance(from, _msgSender(), amount);
        ERC20Upgradeable._transfer(from, to, amount);
        return true;
    }

    // ################### Internal checks before transfers

    /**
     * @dev Functions and modifiers to run prior to allowing a transfer
     * @dev No account on the transfer restriction list should be allowed to send or receive
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        override
        whenNotRestricted(from)
        whenNotRestricted(to)
        whenNotRestricted(tx.origin)
        whenNotPaused
    {
        require(to != address(this), ErrorCoded.ERR_12);
        ERC20Upgradeable._beforeTokenTransfer(from, to, amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override onlyRole(RoleManaged.UPGRADER_ROLE) {
        require(newImplementation.code.length > 0, ErrorCoded.ERR_3);
    }

    function _modifyAllowance(address spender, uint256 value) internal {
        ERC20Upgradeable._approve(_msgSender(), spender, value);
    }
}
