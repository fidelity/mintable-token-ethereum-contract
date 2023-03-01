const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const {
  deployTokenFixture,
  deployTokenFixtureWithRoles,
  defaultAdminRole,
  upgraderRole,
} = require("./shared-setup");

describe("Admin Role", async () => {
  it("Verify role admin of upgrader role", async () => {
    const { admin, token } = await loadFixture(deployTokenFixture);
    const result = await token.connect(admin).getRoleAdmin(upgraderRole);

    expect(result.toString()).to.equal(defaultAdminRole);
  });

  it("admin hasRole", async () => {
    const { admin, token } = await loadFixture(deployTokenFixture);
    await token
      .connect(admin)
      .hasRole(defaultAdminRole, admin.address)
      .then((result) => {
        assert.equal(result, true, "admin should have defaultAdminRole role");
      });
  });

  it("user1 does not have a Role", async () => {
    const { admin, user1, token } = await loadFixture(deployTokenFixture);
    await token
      .connect(admin)
      .hasRole(defaultAdminRole, user1.address)
      .then((result) => {
        assert.equal(
          result,
          false,
          "user1 should not have defaultAdminRole role"
        );
      });
  });
});

describe("Admin User Upgrade", async () => {
  it("Pass when adding a new admin member", async () => {
    const { admin, newAdmin, token } = await loadFixture(deployTokenFixture);
    // adding a role member
    await expect(
      token.connect(admin).grantRole(defaultAdminRole, newAdmin.address)
    ).not.to.be.reverted;

    // verify adding admin member
    assert.isTrue(
      await token.connect(admin).hasRole(defaultAdminRole, newAdmin.address)
    );
  });

  it("Verify admin member change", async () => {
    const { admin, newAdmin, upgrader, token } = await loadFixture(
      deployTokenFixture
    );
    // adding newAdmin as a new admin member
    await expect(
      token.connect(admin).grantRole(defaultAdminRole, newAdmin.address)
    ).not.to.be.reverted;

    // adding upgrader as admin from newAdmin

    await expect(
      token.connect(newAdmin).grantRole(defaultAdminRole, upgrader.address)
    ).not.to.be.reverted;

    // verify adding upgrader as admin
    assert.isTrue(
      await token.connect(admin).hasRole(defaultAdminRole, upgrader.address)
    );

    // remove admin membership from upgrader from newAdmin
    await token
      .connect(newAdmin)
      .revokeRole(defaultAdminRole, upgrader.address);

    // verify revoking the admin membership from upgrader
    assert.isFalse(
      await token.connect(admin).hasRole(defaultAdminRole, upgrader.address)
    );
  });
});

describe("Admin Renouncing Role", async () => {
  it("Should not allow admin to renounce their own role", async function () {
    const { token, other } = await loadFixture(deployTokenFixtureWithRoles);

    await token.grantRole(defaultAdminRole, other.address);
    expect(await token.hasRole(defaultAdminRole, other.address)).to.equal(true);

    await expect(
      token.connect(other).renounceRole(defaultAdminRole, other.address)
    ).to.be.revertedWith(
      "SafeAccessControlEnumerable: Default Admin cannot renounce own role"
    );

    expect(await token.hasRole(defaultAdminRole, other.address)).to.equal(true);
  });

  it("Should fail if user tries to renounce the Default Admin Role", async function () {
    const { token, admin } = await loadFixture(deployTokenFixtureWithRoles);

    await expect(
      token.connect(admin).renounceRole(defaultAdminRole, admin.address)
    ).to.be.revertedWith(
      "SafeAccessControlEnumerable: Default Admin cannot renounce own role"
    );
  });

  it("Should fail if user tries to revoke the Default Admin Role from themselves", async function () {
    const { token, admin } = await loadFixture(deployTokenFixtureWithRoles);

    await expect(
      token.connect(admin).revokeRole(defaultAdminRole, admin.address)
    ).to.be.revertedWith(
      "SafeAccessControlEnumerable: Default Admin cannot renounce own role"
    );
  });

  it("Should allow user to revoke Default Admin Role when there are more than one Default Admins ", async function () {
    const { token, admin, other } = await loadFixture(
      deployTokenFixtureWithRoles
    );

    await token.connect(admin).grantRole(defaultAdminRole, other.address);
    await expect(
      await token.connect(admin).revokeRole(defaultAdminRole, other.address)
    );
  });
});
