const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("Upgrading the contract", async () => {
  it("Should set a var in initializer", async () => {
    const { token, upgrader } = await loadFixture(deployTokenFixtureWithRoles);
    const testUpgradeMintableTokenFactory = await ethers.getContractFactory(
      "TestUpgradeMintableToken",
      upgrader
    );
    const testUpgradeMintableToken = await upgrades.upgradeProxy(
      token.address,
      testUpgradeMintableTokenFactory,
      {
        call: {
          fn: "setNewVar",
          args: [2345],
        },
      }
    );
    expect((await testUpgradeMintableToken.newVar()).toNumber()).to.equal(2345);
  });

  it("Should be able to set a new var", async () => {
    const { token, upgrader } = await loadFixture(deployTokenFixtureWithRoles);
    const testUpgradeMintableTokenFactory = await ethers.getContractFactory(
      "TestUpgradeMintableToken",
      upgrader
    );
    const testUpgradeMintableToken = await upgrades.upgradeProxy(
      token.address,
      testUpgradeMintableTokenFactory
    );
    await testUpgradeMintableToken.setNewVar(1234);
    expect((await testUpgradeMintableToken.newVar()).toNumber()).to.equal(1234);
  });

  it("Should upgrade with an overridden function", async () => {
    const { token, upgrader } = await loadFixture(deployTokenFixtureWithRoles);
    const testUpgradeMintableTokenFactory = await ethers.getContractFactory(
      "TestUpgradeMintableToken",
      upgrader
    );
    const testUpgradeMintableToken = await upgrades.upgradeProxy(
      token.address,
      testUpgradeMintableTokenFactory
    );
    expect(await testUpgradeMintableToken.symbol()).to.equal("TUMT");
    expect(await testUpgradeMintableToken.name()).to.equal(
      "Test Upgrade Mintable Token"
    );
  });

  it("Should upgrade with an added function", async () => {
    const { token, upgrader } = await loadFixture(deployTokenFixtureWithRoles);
    const testUpgradeMintableTokenFactory = await ethers.getContractFactory(
      "TestUpgradeMintableToken",
      upgrader
    );
    const testUpgradeMintableToken = await upgrades.upgradeProxy(
      token.address,
      testUpgradeMintableTokenFactory
    );
    expect(await testUpgradeMintableToken.hello()).to.equal("HELLO");
  });

  it("Should add a function that uses super", async () => {
    const { token, upgrader, minter, mintAllocator } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    const testUpgradeMintableTokenFactory = await ethers.getContractFactory(
      "TestUpgradeMintableToken",
      upgrader
    );
    const testUpgradeMintableToken = await upgrades.upgradeProxy(
      token.address,
      testUpgradeMintableTokenFactory
    );

    await testUpgradeMintableToken
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);

    await testUpgradeMintableToken.connect(minter).mint(minter.address, 200);

    expect(await testUpgradeMintableToken.doubleTotalSupply()).to.equal(400);
  });

  it("Should override a function that uses super", async () => {
    const { token, upgrader, minter, mintAllocator } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    const testUpgradeMintableTokenFactory = await ethers.getContractFactory(
      "TestUpgradeMintableToken",
      upgrader
    );
    const testUpgradeMintableToken = await upgrades.upgradeProxy(
      token.address,
      testUpgradeMintableTokenFactory
    );

    await testUpgradeMintableToken
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 200);

    await testUpgradeMintableToken.connect(minter).mint(minter.address, 200);

    expect(await testUpgradeMintableToken.balanceOf(minter.address)).to.equal(
      400
    );
  });

  it("Should override an external function", async () => {
    const { token, upgrader, pauser } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    const testUpgradeMintableTokenFactory = await ethers.getContractFactory(
      "TestUpgradeMintableToken",
      upgrader
    );
    const testUpgradeMintableToken = await upgrades.upgradeProxy(
      token.address,
      testUpgradeMintableTokenFactory
    );

    await expect(testUpgradeMintableToken.connect(pauser).pause()).to.emit(
      testUpgradeMintableToken,
      "TestUpgradeMintableTokenPaused"
    );
  });
});
