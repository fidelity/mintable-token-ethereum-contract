const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const {
  deployTokenFixture,
  deployTokenFixtureWithRoles,
  upgraderRole,
  mintAllocatorRole,
  tokenTransferControllerRole,
  minterRole,
} = require("./shared-setup");

describe("Grant Role", async () => {
  // removeUpgrader
  // addUpgrader
  it("Should allow an Admin to add an Upgrader ", async () => {
    const { admin, upgrader, token } = await loadFixture(deployTokenFixture);

    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(upgraderRole)
      .then((result) => {
        num = result.toNumber();
      });

    await token.connect(admin).grantRole(upgraderRole, upgrader.address);

    // verify adding upgrader
    assert.isTrue(
      await token.connect(admin).hasRole(upgraderRole, upgrader.address)
    );

    await token
      .connect(admin)
      .getRoleMemberCount(upgraderRole)
      .then((result) => {
        assert.equal(result.toNumber(), num + 1, "Invalid number of upgraders");
      });

    await token
      .connect(admin)
      .getRoleMember(upgraderRole, num)
      .then((result) => {
        assert.equal(
          result.toString(),
          upgrader.address,
          "Invalid upgraderRole address"
        );
      });
  });

  it("Should allow Admin to add MinterAllocator ", async () => {
    const { admin, mintAllocator, token } = await loadFixture(
      deployTokenFixture
    );

    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(mintAllocatorRole)
      .then((result) => {
        num = result.toNumber();
      });
    await expect(
      token.connect(admin).grantRole(mintAllocatorRole, mintAllocator.address)
    ).not.to.be.reverted;

    // verify adding mint allocator
    assert.isTrue(
      await token
        .connect(admin)
        .hasRole(mintAllocatorRole, mintAllocator.address)
    );

    await token
      .connect(admin)
      .getRoleMemberCount(mintAllocatorRole)
      .then((result) => {
        assert.equal(
          result.toNumber(),
          num + 1,
          "Invalid number of mint allocators"
        );
      });

    await token
      .connect(admin)
      .getRoleMember(mintAllocatorRole, num)
      .then((result) => {
        assert.equal(
          result.toString(),
          mintAllocator.address,
          "Invalid mintAllocatorRole address"
        );
      });
  });

  it("Reverts when users who are not admins try to grant roles", async function () {
    const {
      token,
      minter,
      upgrader,
      mintAllocator,
      tokenTransferController,
      other,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await expect(token.connect(minter).grantRole(minterRole, other.address)).to
      .be.reverted;
    await expect(token.connect(upgrader).grantRole(upgraderRole, other.address))
      .to.be.reverted;
    await expect(
      token.connect(mintAllocator).grantRole(mintAllocatorRole, other.address)
    ).to.be.reverted;
    await expect(
      token
        .connect(tokenTransferController)
        .grantRole(tokenTransferControllerRole, other.address)
    ).to.be.reverted;
  });

  it("Reverts when deployer adds Upgrader Role", async () => {
    const { deployer, upgrader, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await expect(
      token.connect(deployer).grantRole(upgraderRole, upgrader.address)
    ).to.be.reverted;
  });

  it("Reverts when zero address attempts to add Upgrader", async () => {
    const { upgrader, token } = await loadFixture(deployTokenFixture);

    await expect(
      token
        .connect(ethers.constants.AddressZero)
        .grantRole(upgraderRole, upgrader.address)
    ).to.be.reverted;
  });

  it("Reverts when deployer adds MinterAllocator ", async () => {
    const { mintAllocator, deployer, token } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      token
        .connect(deployer)
        .grantRole(mintAllocatorRole, mintAllocator.address)
    ).to.be.reverted;
  });

  // addMinter
  it("Should allow Admin to add Minter ", async () => {
    const { admin, minter, token } = await loadFixture(deployTokenFixture);

    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(minterRole)
      .then((result) => {
        num = result.toNumber();
      });

    await expect(token.connect(admin).grantRole(minterRole, minter.address)).not
      .to.be.reverted;

    // verify adding minter
    assert.isTrue(
      await token.connect(admin).hasRole(minterRole, minter.address)
    );

    await token
      .connect(admin)
      .getRoleMemberCount(minterRole)
      .then((result) => {
        assert.equal(result.toNumber(), num + 1, "Invalid number of minters");
      });

    await token
      .connect(admin)
      .getRoleMember(minterRole, num)
      .then((result) => {
        assert.equal(
          result.toString(),
          minter.address,
          "Invalid minterRole address"
        );
      });
  });

  it("Reverts when deployer adds Minter ", async () => {
    const { deployer, minter2, token } = await loadFixture(deployTokenFixture);

    // adding a role member
    await expect(token.connect(deployer).grantRole(minterRole, minter2.address))
      .to.be.reverted;
  });

  // addTokenTransferController
  it("Should allow Admin to add TokenTransferController", async () => {
    const { admin, tokenTransferController, token } = await loadFixture(
      deployTokenFixture
    );

    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(tokenTransferControllerRole)
      .then((result) => {
        num = result.toNumber();
      });

    await expect(
      token
        .connect(admin)
        .grantRole(tokenTransferControllerRole, tokenTransferController.address)
    ).not.to.be.reverted;

    // verify granting role
    assert.isTrue(
      await token
        .connect(admin)
        .hasRole(tokenTransferControllerRole, tokenTransferController.address)
    );

    await token
      .connect(admin)
      .getRoleMemberCount(tokenTransferControllerRole)
      .then((result) => {
        assert.equal(
          result.toNumber(),
          num + 1,
          "Invalid number of token transfer controllers"
        );
      });

    await token
      .connect(admin)
      .getRoleMember(tokenTransferControllerRole, num)
      .then((result) => {
        assert.equal(
          result.toString(),
          tokenTransferController.address,
          "Invalid tokenTransferControllerRole address"
        );
      });
  });

  it("Reverts when deployer attempts to grant TokenTransferController role", async () => {
    const { deployer, tokenTransferController, token } = await loadFixture(
      deployTokenFixture
    );

    // adding a role member
    await expect(
      token
        .connect(deployer)
        .grantRole(tokenTransferControllerRole, tokenTransferController.address)
    ).to.be.reverted;
  });
});
