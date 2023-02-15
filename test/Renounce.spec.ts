const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const {
  deployTokenFixtureWithRoles,
  pauserRole,
  tokenTransferControllerRole,
} = require("./shared-setup");

describe("Renounce Role", async () => {
  it("Should allow owner of the account to remove their own role.", async () => {
    const { token, minterRole, other } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token.grantRole(minterRole, other.address);
    expect(await token.hasRole(minterRole, other.address)).to.be.true;
    await token.connect(other).renounceRole(minterRole, other.address);
    expect(await token.hasRole(minterRole, other.address)).to.be.false;
  });

  it("Should revert/fail when other than owner of the account(except admin) tries to remove their role.", async () => {
    const {
      token,
      minterRole,
      minter,
      mintAllocator,
      upgrader,
      tokenTransferController,
      other,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token.grantRole(minterRole, other.address);
    await expect(token.connect(minter).renounceRole(minterRole, other.address))
      .to.be.reverted;
    await expect(
      token.connect(mintAllocator).renounceRole(minterRole, other.address)
    ).to.be.reverted;
    await expect(
      token.connect(upgrader).renounceRole(minterRole, other.address)
    ).to.be.reverted;
    await expect(
      token
        .connect(tokenTransferController)
        .renounceRole(minterRole, other.address)
    ).to.be.reverted;
    expect(await token.hasRole(minterRole, other.address)).to.be.true;
  });

  it("Pause Reverts after Renounced Role by role member ", async () => {
    const { pauser, token } = await loadFixture(deployTokenFixtureWithRoles);

    // pauser member can pause
    await expect(token.connect(pauser).pause()).not.to.be.reverted;
    // renounce role by tokenTransferController address
    await expect(token.connect(pauser).renounceRole(pauserRole, pauser.address))
      .not.to.be.reverted;
    // pause reverts
    await expect(token.connect(pauser).pause()).to.be.reverted;
  });

  it("Reverts when Renounce role by Admin", async () => {
    const { admin, tokenTransferController, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    // reverts when renounce role by admin
    await expect(
      token
        .connect(admin)
        .renounceRole(
          tokenTransferControllerRole,
          tokenTransferController.address
        )
    ).to.be.revertedWith("AccessControl: can only renounce roles for self");
  });
});
