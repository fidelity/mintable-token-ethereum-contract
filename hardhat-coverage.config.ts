import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "solidity-coverage";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
//
import chai from "chai";
import { solidity } from "ethereum-waffle";

import type { HardhatUserConfig } from "hardhat/config";

chai.use(solidity);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
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
