const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const {
  deployTokenFixtureWithRoles,
  minterRole,
  defaultAdminRole,
} = require("./shared-setup");

const allocationIncrement = 500;

async function deployTokenFixtureWithMintAllocation() {
  const fixture = await deployTokenFixtureWithRoles();
  const { token, mintAllocator, minter } = fixture;

  // Set minting allocation
  await token
    .connect(mintAllocator)
    .increaseMintAllocation(minter.address, allocationIncrement);

  return fixture;
}

describe("Revoke Minter and Set allocation to ZERO", async () => {
  it("Revoke Minter and Verify Allocation", async () => {
    const { admin, minter, token } = await loadFixture(
      deployTokenFixtureWithMintAllocation
    );

    assert.isTrue(
      (await token.connect(admin).mintAllocation(minter.address)) > 0,
      "Minting allocation was not correctly increased"
    );

    // revoke minter_1
    await token.connect(admin).revokeRole(minterRole, minter.address);
    // verify minter allocation
    assert.isTrue(
      (await token.connect(admin).mintAllocation(minter.address)).toNumber() ===
        0,
      "Minting allocation should be set to ZERO"
    );
  });

  it("Reverts when a Minter is trying to revoke another Minter", async () => {
    const { admin, minter, minter2, token } = await loadFixture(
      deployTokenFixtureWithMintAllocation
    );

    await expect(token.connect(admin).grantRole(minterRole, minter2.address))
      .not.to.be.reverted;

    await expect(
      token.connect(minter).revokeRole(minterRole, minter2.address)
    ).to.be.revertedWith(
      `AccessControl: account ${minter.address.toLowerCase()} is missing role ${defaultAdminRole}`
    );
  });
});
