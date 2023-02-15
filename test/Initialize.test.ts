const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { constants } = require("@openzeppelin/test-helpers");
const { assert, expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const { ZERO_ADDRESS } = constants;

const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  defaultAdminRole,
  deployTokenFixture,
} = require("./shared-setup");

describe("Testing the initialize function", async () => {
  it("Should Revert when admin is address(0)", async () => {
    const MintableToken = await ethers.getContractFactory("MintableToken");

    await expect(
      upgrades.deployProxy(
        MintableToken,
        [TOKEN_NAME, TOKEN_SYMBOL, ZERO_ADDRESS],
        {
          kind: "uups",
        }
      )
    ).to.be.revertedWith("MintableToken: Admin address cannot be set to 0");
  });

  it(" Should Revert when trying to re-initialize", async () => {
    const { admin, token } = await loadFixture(deployTokenFixture);

    await expect(
      token.connect(admin).initialize(TOKEN_NAME, TOKEN_SYMBOL, admin.address)
    ).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("Verify admin role", async () => {
    const { admin, token } = await loadFixture(deployTokenFixture);

    assert(token.connect(admin).hasRole(defaultAdminRole, admin.address));
  });
});
