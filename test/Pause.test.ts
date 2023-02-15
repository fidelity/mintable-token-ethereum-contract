const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const { deployTokenFixtureWithRoles, pauserRole } = require("./shared-setup");

describe("Verify pause", async () => {
  it("Should allow Pauser to pause the contract", async function () {
    const { token, pauser } = await loadFixture(deployTokenFixtureWithRoles);

    await token.connect(pauser).pause();
    expect(await token.paused()).to.equal(true);
  });

  it("Should fail/reverted when other Role than Pauser tries to pause the contract", async () => {
    const {
      token,
      minter,
      upgrader,
      mintAllocator,
      tokenTransferController,
      other,
      user1,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await expect(token.connect(user1).pause()).to.be.revertedWith(
      `AccessControl: account ${user1.address.toLowerCase()} is missing role ${pauserRole.toLocaleLowerCase()}`
    );

    await expect(token.connect(minter).pause()).to.be.revertedWith(
      `AccessControl: account ${minter.address.toLowerCase()} is missing role ${pauserRole.toLocaleLowerCase()}`
    );
    await expect(
      token.connect(tokenTransferController).pause()
    ).to.be.revertedWith(
      `AccessControl: account ${tokenTransferController.address.toLowerCase()} is missing role ${pauserRole.toLocaleLowerCase()}`
    );
    await expect(token.connect(mintAllocator).pause()).to.be.revertedWith(
      `AccessControl: account ${mintAllocator.address.toLowerCase()} is missing role ${pauserRole.toLocaleLowerCase()}`
    );
    await expect(token.connect(upgrader).pause()).to.be.revertedWith(
      `AccessControl: account ${upgrader.address.toLowerCase()} is missing role ${pauserRole.toLocaleLowerCase()}`
    );
    await expect(token.connect(other).pause()).to.be.revertedWith(
      `AccessControl: account ${other.address.toLowerCase()} is missing role ${pauserRole.toLocaleLowerCase()}`
    );
  });
  it("Should emit Paused event", async () => {
    const { pauser, token } = await loadFixture(deployTokenFixtureWithRoles);
    await expect(token.connect(pauser).pause()).to.emit(token, "Paused");
  });
});
