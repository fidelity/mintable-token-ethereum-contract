const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

const increaseMintingAllocationAmount = 200;

const mintAmount = 75;
const allowanceAmount = 50;

async function deployMinterWithAllocationFixture() {
  const fixture = await deployTokenFixtureWithRoles();

  const { mintAllocator, minter, token } = fixture;

  await token
    .connect(mintAllocator)
    .increaseMintAllocation(minter.address, increaseMintingAllocationAmount);

  return fixture;
}

describe("burnFrom", async () => {
  it("Should allow minters to burnFrom their own account.", async () => {
    const { token, minter } = await loadFixture(
      deployMinterWithAllocationFixture
    );

    // minter mints themselves tokens
    await token.connect(minter).mint(minter.address, 100);

    // minter burns their tokens
    await token.connect(minter).burnFrom(minter.address, 50);
    expect(await token.balanceOf(minter.address)).to.eq(50);
  });

  it("Should not allow non-minters to burnFrom their own account.", async () => {
    const { token, minter, user1, minterRole } = await loadFixture(
      deployMinterWithAllocationFixture
    );

    // minter mints tokens to a non-minter user1
    await token.connect(minter).mint(user1.address, 100);

    const error = `AccessControl: account ${user1.address.toLowerCase()} is missing role ${minterRole.toLocaleLowerCase()}`;

    // non-minter user1 burns from its own address and transaction is reverted
    await expect(
      token.connect(user1).burnFrom(user1.address, 50)
    ).to.be.revertedWith(error);

    expect(await token.balanceOf(user1.address)).to.eq(100);
  });

  it("should revert if from account is transfer restricted", async () => {
    const { minter, tokenTransferController, other, token } = await loadFixture(
      deployMinterWithAllocationFixture
    );

    // Mint to address
    await token.connect(minter).mint(other.address, mintAmount);

    // Set allowance for minter
    await token.connect(other).approve(minter.address, allowanceAmount);

    // Add token holder to transfer restriction list
    await token
      .connect(tokenTransferController)
      .restrictTransfers(other.address);

    const error =
      "Restrictable: Unable to transfer to or from addresses on transfer restriction list";

    // Burn allowed amount
    await expect(
      token.connect(minter).burnFrom(other.address, allowanceAmount)
    ).to.be.revertedWith(error);
  });

  it("should revert if a minter tries to burn from someone else without an allowance", async () => {
    const { minter, other, token } = await loadFixture(
      deployMinterWithAllocationFixture
    );
    // Mint to address
    await token.connect(minter).mint(other.address, mintAmount);

    const error = "ERC20: insufficient allowance";

    // Attempt to burnFrom, should revert due to allowance
    await expect(
      token.connect(minter).burnFrom(other.address, allowanceAmount + 1)
    ).to.be.revertedWith(error);
  });

  it("should allow a minter to burnFrom someone else when they have been given an allowance", async () => {
    const { token, user1, user2, minterRole, minter } = await loadFixture(
      deployMinterWithAllocationFixture
    );

    await token.grantRole(minterRole, user2.address);

    await token.connect(minter).mint(user1.address, 200);

    // Set allowance for minter
    await token.connect(user1).approve(minter.address, 100);

    // Burn an amount less than the balance
    const burnAmount = 50;
    await expect(() =>
      token.connect(minter).burnFrom(user1.address, burnAmount)
    ).to.changeTokenBalances(token, [user1, minter], [0 - burnAmount, 0]);
  });

  it("should not allow a non-minter to burnFrom someone else when they have been given an allowance", async () => {
    const { token, user1, user2, minter, other, minterRole } =
      await loadFixture(deployMinterWithAllocationFixture);

    await token.connect(minter).mint(user1.address, 200);

    // user1 approves user2 to spend their tokens
    await expect(token.connect(user1).approve(user2.address, 100)).to.emit(
      token,
      "Approval"
    );
    assert.equal(await token.allowance(user1.address, user2.address), 100);

    // user2 cannot burn user1's tokens
    let error = `AccessControl: account ${user2.address.toLowerCase()} is missing role ${minterRole.toLocaleLowerCase()}`;
    await expect(
      token.connect(user2).burnFrom(user1.address, 50)
    ).to.be.revertedWith(error);

    error = `AccessControl: account ${other.address.toLowerCase()} is missing role ${minterRole.toLocaleLowerCase()}`;
    await expect(
      token.connect(other).burnFrom(user1.address, 50)
    ).to.be.revertedWith(error);
  });
});
