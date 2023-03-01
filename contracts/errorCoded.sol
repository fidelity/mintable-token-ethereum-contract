// SPDX-License-Identifier: Apache-2.0
// Copyright FMR LLC
pragma solidity 0.8.9;

/**
 * @title ErrorCoded
 * @dev ErrorCoded is a library that defines custom error types used in Mintable Token
 */

library ErrorCoded {
    string public constant ERR_1 =
        "MintableToken: Unable to transfer to or from addresses on transfer restriction list";
    string public constant ERR_2 =
        "MintableToken: Unable to restrict transfers of 0 address";
    string public constant ERR_3 =
        "Proxiable: Contract must be deployed prior to upgrading";
    string public constant ERR_4 =
        "MintableToken: Amount must be less than the current mint allocation for a minter";
    string public constant ERR_5 =
        "MintableToken: Default Admin cannot renounce own role";
    string public constant ERR_6 =
        "MintableToken: Unable to adjust the mint allocation for a non-minter";
    string public constant ERR_7 =
        "MintableToken: Admin address cannot be set to 0";
    string public constant ERR_10 =
        "MintableToken: Can't revoke or renounce role of the Default Admin when there is only one remaining";
    string public constant ERR_11 = "MintableToken: Arithmetic overflow";
    string public constant ERR_12 =
        "MintableToken: Token cannot be transferred to token contract";
    string public constant ERR_13 = "MintableToken: User does not have role";
}
