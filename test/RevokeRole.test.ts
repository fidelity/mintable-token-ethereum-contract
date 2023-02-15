const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const {
  deployTokenFixture,
  deployTokenFixtureWithRoles,
  upgraderRole,
  mintAllocatorRole,
  tokenTransferControllerRole,
  minterRole,
} = require("./shared-setup");

describe("Revoke Role", async () => {
  // removeUpgrader
  it("Passes When Admin remove Upgrader", async () => {
    const { admin, upgrader, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    // find role member count
    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(upgraderRole)
      .then((result) => {
        num = result.toNumber();
      });

    // remove upgrader
    await token.connect(admin).revokeRole(upgraderRole, upgrader.address);
    // verify revoking upgrader
    assert.isFalse(await token.hasRole(upgraderRole, upgrader.address));

    // verify role member count
    await token
      .connect(admin)
      .getRoleMemberCount(upgraderRole)
      .then((result) => {
        assert.equal(result.toNumber(), num - 1, "Invalid number of upgraders");
      });
    // verify reverts when no address at index num-1
    await expect(token.connect(admin).getRoleMember(upgraderRole, num - 1)).to
      .be.reverted;
  });

  it("Emits events when admin revokes roles", async function () {
    const {
      token,
      minter,
      upgrader,
      mintAllocator,
      minterRole,
      upgraderRole,
      tokenTransferController,
      tokenTransferControllerRole,
      mintAllocatorRole,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await expect(token.revokeRole(minterRole, minter.address)).to.emit(
      token,
      "RoleRevoked"
    );
    await expect(token.revokeRole(upgraderRole, upgrader.address)).to.emit(
      token,
      "RoleRevoked"
    );
    await expect(
      token.revokeRole(mintAllocatorRole, mintAllocator.address)
    ).to.emit(token, "RoleRevoked");

    await expect(
      token.revokeRole(
        tokenTransferControllerRole,
        tokenTransferController.address
      )
    ).to.emit(token, "RoleRevoked");
  });

  it("Reverts when deployer removes Upgrader ", async () => {
    const { deployer, admin, upgrader, token } = await loadFixture(
      deployTokenFixture
    );

    // adding a role member

    await expect(token.connect(admin).grantRole(upgraderRole, upgrader.address))
      .not.to.be.reverted;

    await expect(
      token.connect(deployer).grantRole(upgraderRole, upgrader.address)
    ).to.be.reverted;

    // remove upgrader

    await expect(
      token.connect(admin).revokeRole(upgraderRole, upgrader.address)
    ).not.to.be.reverted;
  });

  // removeMinterAllocator
  it("Passes When Admin remove MinterAllocator", async () => {
    const { admin, mintAllocator, token } = await loadFixture(
      deployTokenFixture
    );

    // adding a role member
    await expect(
      token.connect(admin).grantRole(mintAllocatorRole, mintAllocator.address)
    ).not.to.be.reverted;

    // find role member count
    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(mintAllocatorRole)
      .then((result) => {
        num = result.toNumber();
      });

    // remove MinterAllocator
    await expect(
      token.connect(admin).revokeRole(mintAllocatorRole, mintAllocator.address)
    ).not.to.be.reverted;

    // verify revoking mintallocator
    assert.isFalse(
      await token
        .connect(admin)
        .hasRole(mintAllocatorRole, mintAllocator.address)
    );

    // verify role member count
    await token
      .connect(admin)
      .getRoleMemberCount(mintAllocatorRole)
      .then((result) => {
        assert.equal(
          result.toNumber(),
          num - 1,
          "Invalid number of mint allocators"
        );
      });
    // verify reverts when no address at index num-1
    await expect(token.connect(admin).getRoleMember(mintAllocatorRole, num - 1))
      .to.be.reverted;
  });

  it("Reverts when deployer removes MintAllocator ", async () => {
    const { deployer, admin, mintAllocator, token } = await loadFixture(
      deployTokenFixture
    );

    // adding a role member
    await expect(
      token.connect(admin).grantRole(mintAllocatorRole, mintAllocator.address)
    ).not.to.be.reverted;

    await expect(
      token
        .connect(deployer)
        .revokeRole(mintAllocatorRole, mintAllocator.address)
    ).to.be.reverted;

    // remove MintAllocator
    await expect(
      token.connect(admin).revokeRole(mintAllocatorRole, mintAllocator.address)
    ).not.to.be.reverted;
  });

  // removeMinter
  it("Passes When Admin remove Minter", async () => {
    const { admin, minter, token } = await loadFixture(deployTokenFixture);

    // adding a role member
    await expect(token.connect(admin).grantRole(minterRole, minter.address)).not
      .to.be.reverted;

    // find role member count
    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(minterRole)
      .then((result) => {
        num = result.toNumber();
      });

    // remove minter
    await expect(token.connect(admin).revokeRole(minterRole, minter.address))
      .not.to.be.reverted;

    // verify revoking minter
    assert.isFalse(
      await token.connect(admin).hasRole(minterRole, minter.address)
    );

    // verify role member count

    await token
      .connect(admin)
      .getRoleMemberCount(minterRole)
      .then((result) => {
        assert.equal(
          result.toNumber(),
          num - 1,
          "Invalid number of minter allocators"
        );
      });
    // verify reverts when no address at index num-1
    await expect(token.connect(admin).getRoleMember(minterRole, num - 1)).to.be
      .reverted;
  });

  it("Reverts when deployer removes Minter ", async () => {
    const { deployer, admin, minter, token } = await loadFixture(
      deployTokenFixture
    );

    // adding a role member
    await expect(token.connect(admin).grantRole(minterRole, minter.address)).not
      .to.be.reverted;

    await expect(token.connect(deployer).revokeRole(minterRole, minter.address))
      .to.be.reverted;

    // remove Minter
    await expect(token.connect(admin).revokeRole(minterRole, minter.address))
      .not.to.be.reverted;
  });

  // removeTokenTransferController
  it("Passes When Admin removes Token Transfer Controller", async () => {
    const { admin, tokenTransferController, token } = await loadFixture(
      deployTokenFixture
    );

    // adding a role member
    await expect(
      token
        .connect(admin)
        .grantRole(tokenTransferControllerRole, tokenTransferController.address)
    ).not.to.be.reverted;

    // find role member count
    let num = 0;
    await token
      .connect(admin)
      .getRoleMemberCount(tokenTransferControllerRole)
      .then((result) => {
        num = result.toNumber();
      });

    // remove tokenTransferControllerRole
    await expect(
      token
        .connect(admin)
        .revokeRole(
          tokenTransferControllerRole,
          tokenTransferController.address
        )
    ).not.to.be.reverted;

    // verify revoking tokenTransferControllerRole
    assert.isFalse(
      await token
        .connect(admin)
        .hasRole(tokenTransferControllerRole, tokenTransferController.address)
    );

    // verify role member count
    await token
      .connect(admin)
      .getRoleMemberCount(tokenTransferControllerRole)
      .then((result) => {
        assert.equal(
          result.toNumber(),
          num - 1,
          "Invalid number of token transfer controllers"
        );
      });
    // verify reverts when no address at index num-1
    await expect(
      token.connect(admin).getRoleMember(tokenTransferControllerRole, num - 1)
    ).to.be.reverted;
  });

  it("Reverts when deployer removes TokenTransferController ", async () => {
    const { deployer, admin, tokenTransferController, token } =
      await loadFixture(deployTokenFixture);

    // adding a role member
    await expect(
      token
        .connect(admin)
        .grantRole(tokenTransferControllerRole, tokenTransferController.address)
    ).not.to.be.reverted;

    await expect(
      token
        .connect(deployer)
        .revokeRole(
          tokenTransferControllerRole,
          tokenTransferController.address
        )
    ).to.be.reverted;

    // remove tokenTransferController
    await expect(
      token
        .connect(admin)
        .revokeRole(
          tokenTransferControllerRole,
          tokenTransferController.address
        )
    ).not.to.be.reverted;
  });

  it("Reverts when user does not have role", async () => {
    const { admin, minter, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    assert.isFalse(await token.hasRole(upgraderRole, minter.address));

    await expect(
      token.connect(admin).revokeRole(upgraderRole, minter.address)
    ).to.be.revertedWith("MintableToken: User does not have role");
  });
});
