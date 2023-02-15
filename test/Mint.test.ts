const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { constants } = require("@openzeppelin/test-helpers");
const { expect, assert } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

const mintingAllocation = 100;

async function deployTokenFixtureWithMintAllocation() {
  const fixture = await deployTokenFixtureWithRoles();
  const { token, mintAllocator, minter } = fixture;

  // Set mint allocation
  await token
    .connect(mintAllocator)
    .increaseMintAllocation(minter.address, mintingAllocation);

  return fixture;
}

describe("Minting functions", async () => {
  describe("Minting Tokens", async function () {
    it("Should mint 100 tokens", async function () {
      const { token, minter, other } = await loadFixture(
        deployTokenFixtureWithMintAllocation
      );

      await expect(token.connect(minter).mint(other.address, 100))
        .to.emit(token, "Mint")
        .withArgs(minter.address, other.address, 100);

      expect(await token.balanceOf(other.address)).to.eq(100);
    });

    it("Should decrease mintAllocation", async () => {
      const { admin, minter, token } = await loadFixture(
        deployTokenFixtureWithMintAllocation
      );
      const mintAmount = 75;

      await token.connect(minter).mint(minter.address, mintAmount);

      // Check minted balance is equal to number of tokens minted
      assert.equal(
        await token.connect(admin).balanceOf(minter.address),
        mintAmount,
        "Incorrect number of tokens minted"
      );

      // Check mint allowance was decreased
      assert.equal(
        await token.connect(admin).mintAllocation(minter.address),
        25,
        "Minting allocation was not correctly decreased"
      );
    });

    it("Should fail/revert if the account address minting doesn't have the minter role", async () => {
      const { token, upgrader, mintAllocator, tokenTransferController, other } =
        await loadFixture(deployTokenFixtureWithRoles);
      await expect(token.connect(mintAllocator).mint(other.address, 100)).to.be
        .reverted;
      await expect(
        token.connect(tokenTransferController).mint(other.address, 100)
      ).to.be.reverted;
      await expect(token.connect(upgrader).mint(other.address, 100)).to.be
        .reverted;
    });

    it("Should fail/revert if the account address to be minted and receive tokens is Zero address", async () => {
      const { token, minter, mintAllocator } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, 200);
      await expect(
        token.connect(minter).mint(constants.ZERO_ADDRESS, 100)
      ).to.be.revertedWith("ERC20: mint to the zero address");
    });

    it("Should fail/reverted if the account address to mint is present in the transfer restriction list.", async () => {
      const { token, minter, mintAllocator, tokenTransferController, other } =
        await loadFixture(deployTokenFixtureWithRoles);

      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, 200);
      await expect(() =>
        token.connect(minter).mint(other.address, 100)
      ).to.changeTokenBalance(token, other, 100);
      await token
        .connect(tokenTransferController)
        .restrictTransfers(other.address);
      await expect(
        token.connect(minter).mint(other.address, 100)
      ).to.be.revertedWith(
        "Unable to transfer to or from addresses on transfer restriction list"
      );
    });

    it("Should not allow the account present in transfer restriction list to receive minted tokens.", async () => {
      const { token, mintAllocator, minter, other, tokenTransferController } =
        await loadFixture(deployTokenFixtureWithRoles);

      await token
        .connect(tokenTransferController)
        .restrictTransfers(other.address);

      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, 100);
      await expect(
        token.connect(minter).mint(other.address, 100)
      ).to.be.revertedWith(
        "Unable to transfer to or from addresses on transfer restriction list"
      );
    });

    it("Should fail/reverted if the amount to be minted is greater than the current mint allocation of the minter.", async () => {
      const { token, minter, mintAllocator, other } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, 50);
      await expect(
        token.connect(minter).mint(other.address, 51)
      ).to.be.revertedWith(
        "Amount must be less than the current mint allocation for a minter"
      );
    });
  });
});
