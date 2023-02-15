const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("Approve, transferFrom functions", async () => {
  it("Should set amount of tokens for spender account to spend tokens on behalf of owner.", async () => {
    const { token, user1, user2, minter, mintAllocator } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await expect(token.connect(user1).approve(user2.address, 100))
      .to.emit(token, "Approval")
      .withArgs(user1.address, user2.address, 100);
    assert.equal(await token.allowance(user1.address, user2.address), 100);
  });

  it("Should allow spender account to spend tokens(transferFrom) on behalf of owner approved by the owner.", async () => {
    const { token, user1, user2, minter, mintAllocator, other } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await expect(token.connect(user1).approve(user2.address, 100))
      .to.emit(token, "Approval")
      .withArgs(user1.address, user2.address, 100);
    assert.equal(await token.allowance(user1.address, user2.address), 100);

    await expect(() =>
      token.connect(user2).transferFrom(user1.address, other.address, 50)
    ).to.changeTokenBalances(token, [user1, other], [-50, 50]);
  });

  it("Should revert/fail if spender account not approved by owner tries to spend tokens on behalf of owner.", async () => {
    const { token, user1, user2, minter, mintAllocator, other } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await expect(
      token.connect(other).transferFrom(user1.address, user2.address, 50)
    ).to.be.reverted;
  });

  it("Should fail if approved address attempts to transfer tokens on behalf of owner who's address is in transfer restriction list", async () => {
    const {
      token,
      user1,
      user2,
      minter,
      mintAllocator,
      tokenTransferController,
      other,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await token.connect(user1).approve(user2.address, 100);
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    await expect(
      token.connect(user2).transferFrom(user1.address, other.address, 50)
    ).to.be.revertedWith(
      "Unable to transfer to or from addresses on transfer restriction list"
    );
  });

  it("Should fail if approved address in the transfer restriction list attempts to transfer tokens on behalf of owner", async () => {
    const {
      token,
      user1,
      user2,
      minter,
      mintAllocator,
      tokenTransferController,
      other,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await token.connect(user1).approve(user2.address, 100);
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user2.address);

    await expect(
      token.connect(user2).transferFrom(user1.address, other.address, 50)
    ).to.be.revertedWith(
      "Unable to transfer to or from addresses on transfer restriction list"
    );
  });

  it("Should fail if approved address attempts to transfer tokens to address in transfer restriction list on behalf of owner ", async () => {
    const {
      token,
      user1,
      user2,
      minter,
      mintAllocator,
      tokenTransferController,
      other,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 200);
    await token.connect(user1).approve(user2.address, 100);
    await token
      .connect(tokenTransferController)
      .restrictTransfers(other.address);

    await expect(
      token.connect(user2).transferFrom(user1.address, other.address, 50)
    ).to.be.revertedWith(
      "Unable to transfer to or from addresses on transfer restriction list"
    );
  });
});
