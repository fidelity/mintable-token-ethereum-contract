// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

/**
 * @title ErrorCoded
 * @dev ErrorCoded is a library that defines custom error types used in Mintable Token
 */

library ErrorCoded {
    string public constant ERR_TRANSFER_RESTRICTED =
        "Restrictable: Unable to transfer to or from addresses on transfer restriction list";
    string public constant ERR_TRANSFER_RESTRICTION_INVALID =
        "Restrictable: Unable to restrict transfers of 0 address";
    string public constant ERR_CONTRACT_NOT_DEPLOYED =
        "MintableToken: Contract must be deployed prior to upgrading";
    string public constant ERR_INSUFFICIENT_MINT_ALLOCATION =
        "MintAllocated: Amount must be less than or equal to the current mint allocation for a minter";
    string public constant ERR_DEFAULT_ADMIN_CANNOT_RENOUNCE =
        "SafeAccessControlEnumerable: Default Admin cannot renounce own role";
    string public constant ERR_ONLY_MINTERS_HAVE_MINT_ALLOCATIONS =
        "MintAllocated: Unable to adjust the mint allocation for a non-minter";
    string public constant ERR_ADMIN_ADDRESS_INVALID =
        "MintableToken: Admin address cannot be set to 0";
    string public constant ERR_CANNOT_REVOKE_LAST_DEFAULT_ADMIN =
        "SafeAccessControlEnumerable: Can't revoke or renounce role of the Default Admin when there is only one remaining";
    string public constant ERR_ARITHMETIC_OVERFLOW_ALLOWANCE =
        "MintableToken: Arithmetic overflow";
    string public constant ERR_ARITHMETIC_OVERFLOW_MINT =
        "MintAllocated: Arithmetic overflow";
    string public constant ERR_INVALID_RECIPIENT =
        "MintableToken: Token cannot be transferred to token contract";
    string public constant ERR_USER_DOES_NOT_HAVE_ROLE =
        "SafeAccessControlEnumerable: User does not have role";
    string public constant ERR_RESTRICT_TRANSFERS_ADD =
        "Restrictable: User already in transfer restriction list";
    string public constant ERR_RESTRICT_TRANSFERS_REMOVE =
        "Restrictable: User not in transfer restriction list";
}
