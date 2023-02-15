const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { constants } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("Token Transfer Controller", async () => {
  describe("add/remove address in transfer restriction list", async function () {
    it("Should allow token controller to add a address to the transfer restriction list", async () => {
      const { token, other, tokenTransferController, minterRole } =
        await loadFixture(deployTokenFixtureWithRoles);

      await token.grantRole(minterRole, other.address);
      expect(await token.isTransferRestrictionImposed(other.address)).to.equal(
        false
      );
      await expect(
        token.connect(tokenTransferController).restrictTransfers(other.address)
      ).to.emit(token, "TransferRestrictionImposed");
      expect(await token.isTransferRestrictionImposed(other.address)).to.equal(
        true
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

    it("Should allow token controller to remove the address from the transfer restriction list", async () => {
      const { token, other, tokenTransferController } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      expect(await token.isTransferRestrictionImposed(other.address)).to.equal(
        false
      );
      await token
        .connect(tokenTransferController)
        .restrictTransfers(other.address);
      expect(await token.isTransferRestrictionImposed(other.address)).to.equal(
        true
      );
      await token
        .connect(tokenTransferController)
        .unrestrictTransfers(other.address);
      expect(await token.isTransferRestrictionImposed(other.address)).to.equal(
        false
      );
    });

    it("Should fail/reverted when account with other role than Token Transfer Controller add/remove an address to transfer restriction list", async () => {
      const { token, mintAllocator, minter, other } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await expect(
        token.connect(minter).unrestrictTransfers(other.address)
      ).to.be.revertedWith(
        `AccessControl: account ${minter.address.toLowerCase()} is missing role 0xfacce159e6968cd08fd9a4077ce70318710e6a3e2ca966e7a450e0609027b94e`
      );
      await expect(
        token.connect(mintAllocator).restrictTransfers(other.address)
      ).to.be.revertedWith(
        `AccessControl: account ${mintAllocator.address.toLowerCase()} is missing role 0xfacce159e6968cd08fd9a4077ce70318710e6a3e2ca966e7a450e0609027b94e`
      );
    });

    it("Should revert if address to be added to transfer restriction list is Zero address", async () => {
      const { token, tokenTransferController } = await loadFixture(
        deployTokenFixtureWithRoles
      );

      await expect(
        token
          .connect(tokenTransferController)
          .restrictTransfers(constants.ZERO_ADDRESS)
      ).to.be.revertedWith(
        "MintableToken: Unable to restrict transfers of 0 address"
      );
    });

    it("Should be a count of 3 when adding 3 addresses to the transfer restriction list", async () => {
      const { token, other, minter, mintAllocator, tokenTransferController } =
        await loadFixture(deployTokenFixtureWithRoles);

      await token
        .connect(tokenTransferController)
        .restrictTransfers(other.address);
      await token
        .connect(tokenTransferController)
        .restrictTransfers(minter.address);
      await token
        .connect(tokenTransferController)
        .restrictTransfers(mintAllocator.address);
      expect(await token.getTransferRestrictionCount()).to.eq(3);
    });

    it("Should return the address of a denied account mapped to its index", async () => {
      const { token, other, minter, mintAllocator, tokenTransferController } =
        await loadFixture(deployTokenFixtureWithRoles);

      await token
        .connect(tokenTransferController)
        .restrictTransfers(other.address);
      await token
        .connect(tokenTransferController)
        .restrictTransfers(minter.address);
      await token
        .connect(tokenTransferController)
        .restrictTransfers(mintAllocator.address);

      expect(await token.getTransferRestriction(0)).to.eq(other.address);
      expect(await token.getTransferRestriction(1)).to.eq(minter.address);
      expect(await token.getTransferRestriction(2)).to.eq(
        mintAllocator.address
      );
    });
  });
});
