// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "./errorCoded.sol";
import "./roleManaged.sol";

/**
 * @title MintAllocated
 * @dev MintAllocated enables token minting by addresses with the minter role
 * in accordance with allotments set by mint allocators
 */

contract MintAllocated is
    Initializable,
    AccessControlEnumerableUpgradeable,
    PausableUpgradeable,
    ERC20Upgradeable
{
    function __MintAllocated_init() internal onlyInitializing {}

    function __MintAllocated_init_unchained() internal onlyInitializing {}

    /**
     * @dev Mint Allocation is a per-minter allocation which allows minters to mint a certain number of tokens
     *
     * @notice Mint allocators can add or remove from this allowance
     */
    mapping(address => uint256) public mintAllocation;

    /**
     * @dev Emitted when a `mintAllocation` is updated by a mint allocator
     */
    event MintAllocationChanged(
        address indexed mintAllocator,
        address indexed minter,
        uint256 allocation
    );
    event Mint(address indexed minter, address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 amount);

    modifier isMinter(address actionAccount) {
        require(
            hasRole(RoleManaged.MINTER_ROLE, actionAccount),
            ErrorCoded.ERR_ONLY_MINTERS_HAVE_MINT_ALLOCATIONS
        );
        _;
    }

    /**
     * @dev Allows a mint allocator to increase a minter's mint allocation
     *
     * @param minter the minter's address
     * @param amount total amount by which the mint allocation is increased
     *
     * @notice Only mint allocators can adjust the mint allocation of a minter
     * @notice Only a valid minter address should be able to have an allocation set
     */
    function increaseMintAllocation(
        address minter,
        uint256 amount
    )
        external
        virtual
        whenNotPaused
        onlyRole(RoleManaged.MINT_ALLOCATOR_ROLE)
        isMinter(minter)
    {
        require(
            type(uint256).max - mintAllocation[minter] >= amount,
            ErrorCoded.ERR_ARITHMETIC_OVERFLOW_MINT
        );
        unchecked {
            mintAllocation[minter] = mintAllocation[minter] + amount;
        }
        emit MintAllocationChanged(
            _msgSender(),
            minter,
            mintAllocation[minter]
        );
    }

    /**
     * @dev Atomically decreases the mint allocation of a minter
     *
     * @param minter the minter's address
     * @param amount total amount by which the minter's allocation is decreased
     *
     * @notice Decreases in mint allocation are allowed to succeed even when `amount` exceeds allocation to ensure that a
     * decrease will succeed even in a race condition when a mint separately decreases the `mintAllocation`
     */
    function decreaseMintAllocation(
        address minter,
        uint256 amount
    )
        external
        virtual
        whenNotPaused
        onlyRole(RoleManaged.MINT_ALLOCATOR_ROLE)
        isMinter(minter)
    {
        uint256 newAllocation = mintAllocation[minter] > amount
            ? mintAllocation[minter] - amount
            : 0;

        mintAllocation[minter] = newAllocation;

        emit MintAllocationChanged(
            _msgSender(),
            minter,
            mintAllocation[minter]
        );
    }

    /**
     * @dev Mints tokens to a specified address, decreasing the `mintAllocation` after the coins are minted.
     *
     * @param to address that will receive the newly minted tokens
     * @param amount the quantity of tokens to mint
     *
     * @notice Only minters can use the mint function
     * @notice The minter must have enough tokens in their `mintAllocation` to mint
     */
    function mint(
        address to,
        uint256 amount
    ) external virtual onlyRole(RoleManaged.MINTER_ROLE) {
        require(
            amount <= mintAllocation[_msgSender()],
            ErrorCoded.ERR_INSUFFICIENT_MINT_ALLOCATION
        );
        _mint(to, amount);
        unchecked {
            mintAllocation[_msgSender()] =
                mintAllocation[_msgSender()] -
                amount;
        }
        emit Mint(_msgSender(), to, amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller
     *
     * @param amount the quantity of tokens to burn
     *
     * @notice Only minters are allowed to burn tokens
     */
    function burn(
        uint256 amount
    ) external virtual onlyRole(RoleManaged.MINTER_ROLE) {
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller
     *
     * @notice Only minters are allowed to `burnFrom` their own account
     * or allowances they have been given
     */
    function burnFrom(
        address account,
        uint256 amount
    ) external virtual onlyRole(RoleManaged.MINTER_ROLE) {
        if (account != _msgSender()) {
            _spendAllowance(account, _msgSender(), amount);
        }
        _burn(account, amount);
        emit Burn(account, amount);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
