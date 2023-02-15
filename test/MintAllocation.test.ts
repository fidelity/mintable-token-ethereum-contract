const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("Mint Allocator functions", async () => {
  describe("Allocating MintAllocation value for Minters", async () => {
    it("Should allow Mint Allocator to increase MintAllocation value to minters", async () => {
      const { token, minter, mintAllocator } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await expect(
        token.connect(mintAllocator).increaseMintAllocation(minter.address, 200)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 200);
      assert.equal(await token.mintAllocation(minter.address), 200);
      await expect(
        token.connect(mintAllocator).increaseMintAllocation(minter.address, 200)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 400);
      assert.equal(await token.mintAllocation(minter.address), 400);
    });

    it("Should allow Mint Allocator to decrease MintAllocation value to minters", async () => {
      const { token, minter, mintAllocator } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await expect(
        token.connect(mintAllocator).increaseMintAllocation(minter.address, 400)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 400);
      assert.equal(await token.mintAllocation(minter.address), 400);
      await expect(
        token.connect(mintAllocator).decreaseMintAllocation(minter.address, 200)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 200);
      assert.equal(await token.mintAllocation(minter.address), 200);
    });

    it("Should allow Mint Allocator to decrease MintAllocation value to minters, even if transfer restricted", async () => {
      const { token, minter, tokenTransferController, mintAllocator } =
        await loadFixture(deployTokenFixtureWithRoles);

      await token
        .connect(tokenTransferController)
        .restrictTransfers(minter.address);

      await expect(
        token.connect(mintAllocator).increaseMintAllocation(minter.address, 400)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 400);

      assert.equal(await token.mintAllocation(minter.address), 400);

      await expect(
        token.connect(mintAllocator).decreaseMintAllocation(minter.address, 200)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 200);
      assert.equal(await token.mintAllocation(minter.address), 200);
    });

    it("Should allow Mint Allocator to decrease MintAllocation value to minters, even when mint allocator is transfer restricted", async () => {
      // test included for consistency, in practice a mint allocator would have their role revoked
      // when assigned a transfer restriction
      const { token, minter, tokenTransferController, mintAllocator } =
        await loadFixture(deployTokenFixtureWithRoles);

      await token
        .connect(tokenTransferController)
        .restrictTransfers(mintAllocator.address);

      await expect(
        token.connect(mintAllocator).increaseMintAllocation(minter.address, 400)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 400);

      assert.equal(await token.mintAllocation(minter.address), 400);

      await expect(
        token.connect(mintAllocator).decreaseMintAllocation(minter.address, 200)
      )
        .to.emit(token, "MintAllocationChanged")
        .withArgs(mintAllocator.address, minter.address, 200);
      assert.equal(await token.mintAllocation(minter.address), 200);
    });

    it("Should be reverted if other than account with Mint Allocator role tries to set “MintAllocation” value.", async () => {
      const { token, minter, tokenTransferController, other } =
        await loadFixture(deployTokenFixtureWithRoles);

      await expect(
        token.connect(minter).increaseMintAllocation(minter.address, 100)
      ).to.be.revertedWith(
        `AccessControl: account ${minter.address.toLowerCase()} is missing role 0x0cecf1b455fc79891fde338087a5bc58cc780c12baea2fdc499814ec6b42206a`
      );
      await expect(
        token
          .connect(tokenTransferController)
          .increaseMintAllocation(minter.address, 100)
      ).to.be.revertedWith(
        `AccessControl: account ${tokenTransferController.address.toLowerCase()} is missing role 0x0cecf1b455fc79891fde338087a5bc58cc780c12baea2fdc499814ec6b42206a`
      );
      await expect(
        token.connect(other).increaseMintAllocation(minter.address, 100)
      ).to.be.revertedWith(
        `AccessControl: account ${other.address.toLowerCase()} is missing role 0x0cecf1b455fc79891fde338087a5bc58cc780c12baea2fdc499814ec6b42206a`
      );
    });

    it("Should be reverted if the account passed through “MintAllocation” function does not have Minter Role", async () => {
      const { token, mintAllocator, tokenTransferController, upgrader, other } =
        await loadFixture(deployTokenFixtureWithRoles);

      await expect(
        token
          .connect(mintAllocator)
          .increaseMintAllocation(tokenTransferController.address, 100)
      ).to.be.revertedWith(
        "MintableToken: Unable to adjust the mint allocation for a non-minter"
      );
      await expect(
        token
          .connect(mintAllocator)
          .increaseMintAllocation(mintAllocator.address, 100)
      ).to.be.revertedWith(
        "MintableToken: Unable to adjust the mint allocation for a non-minter"
      );
      await expect(
        token
          .connect(mintAllocator)
          .increaseMintAllocation(upgrader.address, 100)
      ).to.be.revertedWith(
        "MintableToken: Unable to adjust the mint allocation for a non-minter"
      );
      await expect(
        token.connect(mintAllocator).increaseMintAllocation(other.address, 100)
      ).to.be.revertedWith(
        "MintableToken: Unable to adjust the mint allocation for a non-minter"
      );
    });

    it("Should set Mint Allocation to 0 if Minter gets their role revoked.", async () => {
      const { token, minter, minterRole, mintAllocator } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, 200);
      assert.equal(await token.mintAllocation(minter.address), 200);
      expect(await token.hasRole(minterRole, minter.address)).to.equal(true);
      await token.revokeRole(minterRole, minter.address);
      expect(await token.hasRole(minterRole, minter.address)).to.equal(false);
      assert.equal(await token.mintAllocation(minter.address), 0);
    });

    it("Should set mintAllocation to 0 if decrease MintAllocation amount is higher than current mint allocated", async () => {
      const { token, minter, mintAllocator } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, 100);
      await token
        .connect(mintAllocator)
        .decreaseMintAllocation(minter.address, 200);
      assert.equal(await token.mintAllocation(minter.address), 0);
    });

    it("Should overflow when mintAllocator increases allocation above MAX_UINT", async () => {
      const { token, minter, mintAllocator } = await loadFixture(
        deployTokenFixtureWithRoles
      );
      const closeToOverflowAmount = ethers.constants.MaxUint256.sub(
        ethers.BigNumber.from("50")
      );

      await token
        .connect(mintAllocator)
        .increaseMintAllocation(minter.address, closeToOverflowAmount);

      await expect(
        token
          .connect(mintAllocator)
          .increaseMintAllocation(minter.address, ethers.BigNumber.from("100"))
      ).to.be.revertedWith("MintableToken: Arithmetic overflow");

      expect(await token.mintAllocation(minter.address)).to.equal(
        closeToOverflowAmount
      );
    });
  });
});
