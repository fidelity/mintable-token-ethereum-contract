import { ethers, upgrades } from "hardhat";

import type { MintableToken } from "../typechain-types";

export const defaultAdminRole = ethers.constants.HashZero;
export const minterRole = ethers.utils.id("MINTER_ROLE");
export const upgraderRole = ethers.utils.id("UPGRADER_ROLE");
export const mintAllocatorRole = ethers.utils.id("MINT_ALLOCATOR_ROLE");
export const tokenTransferControllerRole = ethers.utils.id(
  "TOKEN_TRANSFER_CONTROLLER_ROLE"
);

export const pauserRole = ethers.utils.id("PAUSER_ROLE");

export const TOKEN_NAME = "Test Mintable Token";
export const TOKEN_SYMBOL = "TMT";
export const TOKEN_DECIMALS = 18;

export async function deployTokenFixture() {
  const TokenFactory = await ethers.getContractFactory("MintableToken");

  const [
    deployer,
    admin,
    mintAllocator,
    minter,
    minter2,
    tokenTransferController,
    pauser,
    upgrader,
    user1,
    user2,
    other,
    newAdmin,
    validIssuerAccount,
    holderWallet,
  ] = await ethers.getSigners();

  const roles = await ethers.getContractFactory("RoleManaged");
  const ROLE = await roles.deploy();
  await ROLE.deployed();

  const err = await ethers.getContractFactory("ErrorCoded");
  const ERR = await err.deploy();
  await ERR.deployed();

  const initializerArgs = [TOKEN_NAME, TOKEN_SYMBOL, admin.address];
  const token = (await upgrades.deployProxy(TokenFactory, initializerArgs, {
    initializer: "initialize",
    libraries: {
      roleManaged: ROLE.address,
      errorCoded: ERR.address,
    },
    kind: "uups",
  })) as MintableToken;

  await token.deployed();

  return {
    TokenFactory,
    token: token.connect(admin),
    roleLib: ROLE,
    admin,
    mintAllocator,
    minter,
    minter2,
    tokenTransferController,
    pauser,
    upgrader,
    deployer,
    user1,
    user2,
    other,
    newAdmin,
    validIssuerAccount,
    holderWallet,

    //
    minterRole,
    upgraderRole,
    mintAllocatorRole,
    tokenTransferControllerRole,
    pauserRole,
  };
}

export async function deployTokenFixtureWithRoles() {
  const fixture = await deployTokenFixture();
  const {
    token,
    admin,
    upgrader,
    mintAllocator,
    minter,
    minter2,
    tokenTransferController,
    pauser,
  } = fixture;

  await token.connect(admin).grantRole(upgraderRole, upgrader.address);

  await token.connect(admin).grantRole(minterRole, minter.address);
  await token.connect(admin).grantRole(minterRole, minter2.address);

  await token
    .connect(admin)
    .grantRole(mintAllocatorRole, mintAllocator.address);

  await token
    .connect(admin)
    .grantRole(tokenTransferControllerRole, tokenTransferController.address);

  await token.connect(admin).grantRole(pauserRole, pauser.address);

  return fixture;
}
