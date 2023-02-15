import { ethers } from "hardhat";

import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { DeployFunction } from "hardhat-deploy/types";

export const TOKEN_NAME = "Test Mintable Token";
export const TOKEN_SYMBOL = "TMT";
export const TOKEN_DECIMALS = 18;

export const defaultAdminRole = ethers.constants.HashZero;
export const minterRole = ethers.utils.id("MINTER_ROLE");
export const upgraderRole = ethers.utils.id("UPGRADER_ROLE");
export const mintAllocatorRole = ethers.utils.id("MINT_ALLOCATOR_ROLE");
export const tokenTransferControllerRole = ethers.utils.id(
  "TOKEN_TRANSFER_CONTROLLER_ROLE"
);

const func: DeployFunction = async ({
  deployments,
  getChainId,
  getUnnamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const [
    ,
    admin,
    mintAllocator,
    minter,
    minter2,
    tokenTransferController,
    upgrader,
  ] = await ethers.getSigners();

  const token = await ethers.getContract("MintableToken");

  await token.connect(admin).grantRole(upgraderRole, upgrader.address);
  await token.connect(admin).grantRole(minterRole, minter.address);
  await token.connect(admin).grantRole(minterRole, minter2.address);

  await token
    .connect(admin)
    .grantRole(mintAllocatorRole, mintAllocator.address);

  await token
    .connect(admin)
    .grantRole(tokenTransferControllerRole, tokenTransferController.address);
};

export default func;
