const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { constants } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("Transfer function", async () => {
  it("Should be able to transfer tokens successfully from one account to another account", async () => {
    const { token, minter, mintAllocator, user1, user2 } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 100);
    await expect(() =>
      token.connect(user1).transfer(user2.address, 50)
    ).to.changeTokenBalances(token, [user1, user2], [-50, 50]);
  });

  it("Should revert the transaction if amount to be transferred is greater than the sender's balance.", async () => {
    const { token, minter, mintAllocator, user1, user2 } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 50);
    await expect(
      token.connect(user1).transfer(user2.address, 51)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should revert the transaction if sender/recipient address is zero address", async () => {
    const { token, minter, mintAllocator, user1, user2 } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 100);
    await expect(token.connect(user1).transfer(constants.ZERO_ADDRESS, 50)).to
      .be.reverted;
    await expect(
      token.connect(constants.ZERO_ADDRESS).transfer(user2.address, 50)
    ).to.be.reverted;
  });

  it("Should revert/fail if the account address from/to is present in the transfer restriction list.", async () => {
    const {
      token,
      tokenTransferController,
      minter,
      mintAllocator,
      user1,
      user2,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 100);
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user2.address);
    await expect(
      token.connect(user1).transfer(user2.address, 50)
    ).to.be.revertedWith(
      "Unable to transfer to or from addresses on transfer restriction list"
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);
    await expect(
      token.connect(user1).transfer(user2.address, 50)
    ).to.be.revertedWith(
      "Unable to transfer to or from addresses on transfer restriction list"
    );
  });

  it("Should revert the transaction if recipient is the token contract itself", async () => {
    const { token, minter, mintAllocator, user1 } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(user1.address, 100);
    await expect(
      token.connect(user1).transfer(token.address, 50)
    ).to.be.revertedWith(
      "MintableToken: Token cannot be transferred to token contract"
    );
  });
});
