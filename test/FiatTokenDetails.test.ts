const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const {
  deployTokenFixture,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_DECIMALS,
} = require("./shared-setup");

describe("Verify details", async () => {
  it("Should get decimals", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.decimals()).to.equal(TOKEN_DECIMALS);
  });

  it("Should get symbol", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
  });

  it("Should get name", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.name()).to.equal(TOKEN_NAME);
  });
});
