const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");

const {
  deployTokenFixtureWithRoles,
  deployTokenFixture,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_DECIMALS,
  defaultAdminRole,
} = require("./shared-setup");

describe("Deployment", async () => {
  it("The deployer address may be different from the default Admin Role ", async () => {
    const { token, deployer, admin } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    assert(deployer.address);
    expect(await token.getRoleMember(defaultAdminRole, 0)).to.equal(
      admin.address
    );
  });

  it("Should initialize the initializer from the contract and set the token with correct name ", async () => {
    const { token } = await loadFixture(deployTokenFixture);

    expect(await token.name()).to.equal(TOKEN_NAME);
  });

  it("Should initialize the initializer from the contract and set the token with correct symbol ", async () => {
    const { token } = await loadFixture(deployTokenFixture);

    expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
  });

  it("Token Decimal must be explicitly set as 18", async function () {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.decimals()).to.equal(TOKEN_DECIMALS);
  });

  it("Total Supply should equal 0 when deployed", async function () {
    const { token } = await loadFixture(deployTokenFixture);

    expect(await token.totalSupply()).to.equal(0);
  });

  it("Should successfully deploy", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    const contractAddress = token.address;
    assert.notEqual(contractAddress, 0x0, "address cannot be zero");
    assert.notEqual(contractAddress, "", "address cannot be empty");
    assert.notEqual(contractAddress, null, "address cannot be null");
    assert.notEqual(contractAddress, undefined, "address cannot be undefined");
  });
});
