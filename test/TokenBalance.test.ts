const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert } = require("chai");
const { expect } = require("chai");

const {
  minterRole,
  mintAllocatorRole,
  deployTokenFixture,
} = require("./shared-setup");

describe("Test balanceOf function ", async () => {
  describe("when the user1 has no tokens", function () {
    it("returns zero", async function () {
      const { admin, user1, token } = await loadFixture(deployTokenFixture);

      assert(await token.connect(admin).balanceOf(user1.address), 0);
    });
  });

  describe("when the user1 account has some tokens", function () {
    it("returns the total amount of tokens", async function () {
      const { admin, user1, mintAllocator, minter, token } = await loadFixture(
        deployTokenFixture
      );

      const allocationAmount = 1000;
      const mintAmount = 500;
      // Create minter
      await token.connect(admin).grantRole(minterRole, minter.address);

      // Create mint allocator
      await token
        .connect(admin)
        .grantRole(mintAllocatorRole, mintAllocator.address);

      // Set mint allocation
      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, allocationAmount);

      // Mint to own address
      await token.connect(minter).mint(minter.address, mintAmount);

      await expect(token.connect(minter).transfer(user1.address, 10)).not.to.be
        .reverted;

      assert(await token.balanceOf(user1.address), 0);
    });
  });
});
