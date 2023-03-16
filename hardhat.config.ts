import chai from "chai";
import { solidity } from "ethereum-waffle";

import type { HardhatUserConfig } from "hardhat/config";

import "dotenv/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-storage-layout";
import "solidity-coverage";
import "@openzeppelin/test-helpers";

chai.use(solidity);

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      throwOnCallFailures: false,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};

export default config;
