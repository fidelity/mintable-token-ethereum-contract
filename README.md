# Fidelity Digital Dollar (FIDD)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This is the official repository for Fidelity Digital Dollar (FIDD), a fully collateralized stablecoin pegged 1:1 with the US Dollar.

The contracts in this repository are deployed to the Ethereum blockchain.

## Overview

The Fidelity Digital Dollar (FIDD) is issued by Fidelity Digital Assets, National Association. FIDD is an ERC-20 token issued and managed on the Ethereum network that can be bought and redeemed for $1 on the Fidelity Digital Assets platform. It is backed by assets of an equal or greater value held in cash, U.S. treasuries or other safe, liquid assets. Circulating supply is controlled by Fidelity Digital Assets through the issuance and redemption of FIDD tokens in exchange for equal amounts of USD.

## Contract Addresses

| Network | Address |
| ------- | ------- |
| Ethereum Mainnet | 0x7c135549504245b5eae64fc0e99fa5ebabb8e35d |

## Smart Contract Details

**Token Name:** Fidelity Digital Dollar

**Symbol:** FIDD

**Decimals:** 18

**Standard:** ERC-20

**Network:** Ethereum Mainnet

## Features

### ERC-20 Compatibility

This contract conforms with the ERC-20 standard for compatibility with wallets and protocols.

### Minting Framework

In order to enable business processes around securely minting and burning tokens, this token manages minting and burning with privileged roles, that can mint out of mint allocations. An address with a `MINTER_ROLE` can mint tokens out of a mint allocation, supplied by a `MINT_ALLOCATOR_ROLE`.


### Token Restriction List

To enable regulatory control, and prevent illicit use, this token implements a denylist. Members of the denylist are prevented from using the token, and tokens they have already are frozen until the restriction is lifted.


### Upgradeability

The token can be upgraded to enable new functionality in the future.

FIDD uses an ERC-1967 Proxy pattern to allow for future upgrades. A proxy provides a consistent address for the smart contract and persistent storage between upgrades. Calls made to the proxy contract are delegated to an implementation contract, which can be replaced. Upgradeability is implemented via OpenZeppelin smart contract libraries.

### Audit

These contracts were audited by OpenZeppelin. [You can find the audit here](./audits/Fidelity_Mintable_Token_Audit_Report-OpenZeppelin.pdf).


## Roles

This token uses role-based access control to confer special abilities to EOAs and contracts. These roles include:


| role | role id | capability |
| ---- | ------- | ---------- |
| `minter` | `keccak256("MINTER_ROLE")` | mint tokens in accordance with a mint allocation |
| `mintAllocator` | `keccak256("MINT_ALLOCATOR_ROLE")` | manage mint allocations |
| `upgrader` | `keccak256("UPGRADER_ROLE")` | upgrade the implementation contract |
|`transfer controller` | `keccak256("TOKEN_TRANSFER_CONTROLLER_ROLE")` | restrict transfers of tokens |
| `pauser` | `keccak256("PAUSER_ROLE")` | pause the token |


## Additional Functionality

Beyond the functions available in the ERC-20 standard, FIDD implements functionality to facilitate secure minting of tokens and regulatory compliance, including:

| function | capability |
| -------- | -----------|
| `mint(address to, uint256 amount)` | mint new tokens |
| `increaseMintAllocation(address minter, uint256 amount)` | increase the allocation of tokens that a minter can mint |
| `decreaseMintAllocation(address minter, uint256 amount)` | decrease the allocation of tokens that a minter can mint |
| `burn(address from, uint256 amount)` | burn tokens (only available to minters) |
| `burnFrom(address from, uint256 amount)` | burn tokens (allows a minter to burn tokens, with approval) |
| `pause()` | globally pause the contract |
| `restrictTranfers(address account)` | restrict an account's ability to transfer and receive tokens |
| `unrestrictTranfers(address account)` | unrestrict an account's ability to transfer and receive tokens |

Additionally, it implements `increaseAllowance` and `decreaseAllowance`, to avoid widely known complications around transaction ordering when using the ERC-20 method `approve` as documented [in the ERC-20 specification](https://github.com/ethereum/ercs/blob/master/ERCS/erc-20.md#approve).

## Development

Install dependencies

```
$ npm i
```

Compile contracts

```
$ npm run build
```

Compile contracts and run tests

```
$ npm run test
```

Report test coverage report

```
$ npm run coverage
```

## Notes

This repository is intended as a point-in-time snapshot of the FIDD contracts and tooling used at the deployment of FIDD. This contract, and all its dependencies, have therefore been frozen and will not be updated.
