const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

const mintingAllocation = 100;
const mintAmount = 75;
const burnAmount = 25;

describe("Burn", async () => {
  it("Should allow Minter role to burn tokens it owns", async () => {
    const { admin, mintAllocator, minter, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    // Set minting allocation
    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, mintingAllocation);

    // Mint to own address
    await token.connect(minter).mint(minter.address, mintAmount);

    // Burn tokens
    await token.connect(minter).burn(burnAmount);

    // Check balance after
    assert.equal(
      await token.connect(admin).balanceOf(minter.address),
      mintAmount - burnAmount,
      "Burned incorrect number of tokens"
    );
  });

  it("Should fail/reverted if the account address from burning is present in the transfer restriction list.", async () => {
    const { token, minter, mintAllocator, tokenTransferController } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(minter.address, 200);
    await token
      .connect(tokenTransferController)
      .restrictTransfers(minter.address);
    await expect(token.connect(minter).burn(100)).to.be.revertedWith(
      "Unable to transfer to or from addresses on transfer restriction list"
    );
  });

  it("cannot burn more tokens than it owns", async () => {
    const { admin, minter, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    // Get current token balance
    const balance = await token.connect(admin).balanceOf(minter.address);

    // Attempt to burn tokens from other address should revert
    await expect(token.connect(minter).burn(balance + 1)).to.be.revertedWith(
      "ERC20: burn amount exceeds balance"
    );
  });

  it("Should fail/revert if other than Minter role tries to burn tokens from self.", async () => {
    const { token, minter, mintAllocator, tokenTransferController, other } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);

    await token.connect(minter).mint(other.address, 100);
    await token.connect(minter).mint(tokenTransferController.address, 100);
    await expect(token.connect(other).burn(50)).to.be.reverted;
    await expect(token.connect(tokenTransferController).burn(50)).to.be
      .reverted;
  });
});
