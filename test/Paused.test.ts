const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("Paused", async () => {
  it("Should revert if user tries to increase allowance while contract is paused", async () => {
    const { token, user1, user2, minter, mintAllocator, pauser } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await expect(token.connect(user1).approve(user2.address, 50)).to.emit(
      token,
      "Approval"
    );
    await token.connect(pauser).pause();

    await expect(token.connect(user1).increaseAllowance(user2.address, 100)).to
      .be.reverted;
  });

  it("Should revert if user tries to decrease allowance while contract is paused", async () => {
    const { token, user1, user2, minter, mintAllocator, pauser } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await expect(token.connect(user1).approve(user2.address, 50)).to.emit(
      token,
      "Approval"
    );
    await token.connect(pauser).pause();

    await expect(token.connect(user1).decreaseAllowance(user2.address, 100)).to
      .be.reverted;
  });

  it("Should fail if address attempts to approve another address while contract is paused", async () => {
    const { token, user1, user2, minter, mintAllocator, pauser } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await token.connect(pauser).pause();

    await expect(
      token.connect(user1).approve(user2.address, 100)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("Should NOT revert if Token Transfer Controller tries to add user to restrict transfer list while the contract is paused", async function () {
    const { token, tokenTransferController, pauser, other } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token.connect(pauser).pause();
    await expect(
      token.connect(tokenTransferController).restrictTransfers(other.address)
    ).not.to.be.reverted;
  });

  it("Should NOT revert if Token Transfer Controller tries to remove user to restrict transfer list while the contract is paused", async function () {
    const { token, tokenTransferController, pauser, other } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(tokenTransferController)
      .restrictTransfers(other.address);
    await token.connect(pauser).pause();
    await expect(
      token.connect(tokenTransferController).unrestrictTransfers(other.address)
    ).not.to.be.reverted;
  });
});
