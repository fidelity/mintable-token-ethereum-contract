const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert } = require("chai");

const {
  deployTokenFixture,
  deployTokenFixtureWithRoles,
} = require("./shared-setup");

describe("Verify initial total supply is correct", async () => {
  it("can get the initial totalSupply of the contract", async () => {
    const { admin, token } = await loadFixture(deployTokenFixture);
    const initialSupply = await token.connect(admin).totalSupply();
    assert.equal(initialSupply, 0, "The initial totalSupply should be 0");
  });
});

describe("Verify total supply can be viewed by operational and retail users", async () => {
  let token;
  let admin;
  let minter;
  let mintAllocator;
  let upgrader;
  let user1;
  let tokenTransferController;

  before(async () => {
    ({
      admin,
      minter,
      mintAllocator,
      upgrader,
      user1,
      tokenTransferController,
      token,
    } = await loadFixture(deployTokenFixtureWithRoles));

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, 500);

    await token.connect(minter).mint(minter.address, 500);
  });

  it("can view total supply as Admin user", async () => {
    assert.equal(
      await token.connect(admin).totalSupply(),
      500,
      `The total supply should be equal to 500`
    );
  });

  it("can view total supply as mintAllocator", async () => {
    assert.equal(
      await token.connect(mintAllocator).totalSupply(),
      500,
      `The total supply should be equal to 500`
    );
  });

  it("can view total supply as MINTER", async () => {
    assert.equal(
      await token.connect(minter).totalSupply(),
      500,
      `The total supply should be equal to 500`
    );
  });

  it("can view total supply as upgrader", async () => {
    assert.equal(
      await token.connect(upgrader).totalSupply(),
      500,
      `The total supply should be equal to 500`
    );
  });

  it("can view total supply as tokenTransferController", async () => {
    assert.equal(
      await token.connect(tokenTransferController).totalSupply(),
      500,
      `The total supply should be equal to 500`
    );
  });

  it("can view total supply as Retail user", async () => {
    assert.equal(
      await token.connect(user1).totalSupply(),
      500,
      `The total supply should be equal to 500`
    );
  });
});
