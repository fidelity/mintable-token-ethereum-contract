const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

describe("Unpause", async () => {
  it("Should allow the Admin to unpause", async () => {
    const { admin, pauser, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token.connect(pauser).pause();

    await expect(token.connect(admin).unpause()).not.to.be.reverted;
  });

  it("Should fail/revert when unpause called from non-admin address", async () => {
    const { pauser, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token.connect(pauser).pause();

    // default admin can unpause
    await expect(token.connect(user1).unpause()).to.be.reverted;
  });
});
