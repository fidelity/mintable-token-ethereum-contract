const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("TxOrigin Transfer function", async () => {
  it("Should be able to transfer tokens successfully from the dummy token proxy", async () => {
    const { token, minter, mintAllocator, user1, user2 } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    const testTokenProxyFactory = await ethers.getContractFactory(
      "TokenProxy",
      user1
    );

    const tokenProxy = await testTokenProxyFactory.deploy(token.address);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(tokenProxy.address, 100);

    await expect(() =>
      tokenProxy.connect(user1).transfer(user2.address, 50)
    ).to.changeTokenBalances(token, [tokenProxy, user2], [-50, 50]);
  });

  it("Should revert/fail if the tx origin address is present in the transfer restriction list.", async () => {
    const {
      token,
      tokenTransferController,
      minter,
      mintAllocator,
      user1,
      user2,
    } = await loadFixture(deployTokenFixtureWithRoles);

    const testTokenProxyFactory = await ethers.getContractFactory(
      "TokenProxy",
      user1
    );

    const tokenProxy = await testTokenProxyFactory.deploy(token.address);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);
    await token.connect(minter).mint(tokenProxy.address, 100);

    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    await expect(
      tokenProxy.connect(user1).transfer(user2.address, 50)
    ).to.be.revertedWith(
      "Unable to transfer to or from addresses on transfer restriction list"
    );
  });
});
