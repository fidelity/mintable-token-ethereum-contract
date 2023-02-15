import { ethers, upgrades } from "hardhat";

import type { MintableToken } from "../typechain-types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { DeployFunction } from "hardhat-deploy/types";

export const TOKEN_NAME = "Test Mintable Token";
export const TOKEN_SYMBOL = "TMT";
export const TOKEN_DECIMALS = 18;

const func: DeployFunction = async ({
  deployments,
  getChainId,
  getUnnamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;

  const TokenFactory = await ethers.getContractFactory("MintableToken");

  const [deployer, admin] = await getUnnamedAccounts();
  // ] = await ethers.getSigners();

  const roleLibrary = await deploy("RoleManaged", {
    from: deployer,
  });

  const errorLibrary = await deploy("ErrorCoded", {
    from: deployer,
  });

  const initializerArgs = [TOKEN_NAME, TOKEN_SYMBOL, admin];

  const token = (await upgrades.deployProxy(TokenFactory, initializerArgs, {
    initializer: "initialize",
    libraries: {
      roleManaged: roleLibrary.address,
      errorCoded: errorLibrary.address,
    },
    kind: "uups",
  })) as MintableToken;

  await token.deployed();
  const artifact = await deployments.getExtendedArtifact("MintableToken");
  const proxyDeployment = {
    address: token.address,
    ...artifact,
  };

  await deployments.save("MintableToken", proxyDeployment);
};

export default func;
