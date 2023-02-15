const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const {
  deployTokenFixture,
  upgraderRole,
  mintAllocatorRole,
  minterRole,
  pauserRole,
  tokenTransferControllerRole,
} = require("./shared-setup");

describe("Verify roles", async () => {
  it("Should get roles", async () => {
    const { roleLib } = await loadFixture(deployTokenFixture);
    expect(await roleLib.PAUSER_ROLE()).to.equal(pauserRole);
    expect(await roleLib.UPGRADER_ROLE()).to.equal(upgraderRole);
    expect(await roleLib.MINT_ALLOCATOR_ROLE()).to.equal(mintAllocatorRole);
    expect(await roleLib.MINTER_ROLE()).to.equal(minterRole);
    expect(await roleLib.TOKEN_TRANSFER_CONTROLLER_ROLE()).to.equal(
      tokenTransferControllerRole
    );
  });
});
