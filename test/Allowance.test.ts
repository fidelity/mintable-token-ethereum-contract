const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const { deployTokenFixtureWithRoles } = require("./shared-setup");
const ADDRESS_DENIED_ERROR =
  "MintableToken: Unable to transfer to or from addresses on transfer restriction list";

describe("Increase/Decrease Allowance", async () => {
  it("Should allow owner to add/decrease token range to be spend by the spender on behalf of owner", async () => {
    const { token, user1, user2, minter, mintAllocator } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await expect(token.connect(user1).approve(user2.address, 50))
      .to.emit(token, "Approval")
      .withArgs(user1.address, user2.address, 50);

    await expect(token.connect(user1).increaseAllowance(user2.address, 100))
      .to.emit(token, "Approval")
      .withArgs(user1.address, user2.address, 150);
    assert.equal(await token.allowance(user1.address, user2.address), 150);

    await expect(token.connect(user1).decreaseAllowance(user2.address, 100))
      .to.emit(token, "Approval")
      .withArgs(user1.address, user2.address, 50);
    assert.equal(await token.allowance(user1.address, user2.address), 50);
  });

  it("Should set an allowance to zero if decreased by amount greater than allawance", async () => {
    const { token, user1, user2, minter, mintAllocator } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await expect(token.connect(user1).approve(user2.address, 100)).to.emit(
      token,
      "Approval"
    );

    await token.connect(user1).decreaseAllowance(user2.address, 150);
    assert.equal(await token.allowance(user1.address, user2.address), 0);
  });

  it("should revert when from address is transfer restricted", async () => {
    const { tokenTransferController, user1, user2, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user2.address);
    await expect(
      token.connect(user2).approve(user1.address, 10)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });

  it("should revert when to address is transfer restricted", async () => {
    const { tokenTransferController, user1, user2, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);
    await expect(
      token.connect(user2).approve(user1.address, 10)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });

  it("should revert when setting approval and from address is transfer restricted", async () => {
    const { tokenTransferController, user1, user2, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);
    await expect(
      token.connect(user1).approve(user2.address, 10)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });

  it("should revert when increasing allowance and from address is transfer restricted", async () => {
    const { tokenTransferController, user1, user2, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);
    await expect(
      token.connect(user1).increaseAllowance(user2.address, 10)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });

  it("should not revert when decreasing allowance even if from address is transfer restricted", async () => {
    const { tokenTransferController, user1, user2, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token.connect(user1).increaseAllowance(user2.address, 100);
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    await token.connect(user1).decreaseAllowance(user2.address, 60);

    expect(await token.allowance(user1.address, user2.address)).to.equal(40);
  });

  it("Should revert when an owner increasing approval results in an overflow", async () => {
    const { token, user1, user2, minter, mintAllocator } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    const closeToOverflowAmount = ethers.constants.MaxUint256.sub(
      ethers.BigNumber.from("50")
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, ethers.constants.MaxUint256);
    await token.connect(user1).approve(user2.address, closeToOverflowAmount);

    await expect(
      token
        .connect(user1)
        .increaseAllowance(user2.address, ethers.BigNumber.from("100"))
    ).to.be.revertedWith("MintableToken: Arithmetic overflow");

    expect(await token.allowance(user1.address, user2.address)).to.equal(
      closeToOverflowAmount
    );
  });
});
