const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");

const allocationAmount = 1000;
const mintAmount = 500;
const ADDRESS_DENIED_ERROR =
  "MintableToken: Unable to transfer to or from addresses on transfer restriction list";

async function deployTransferFixture() {
  const fixture = await deployTokenFixtureWithRoles();

  const { mintAllocator, minter, token } = fixture;

  await token
    .connect(mintAllocator)
    .increaseMintAllocation(minter.address, allocationAmount);

  await token.connect(minter).mint(minter.address, mintAmount);
  return fixture;
}

describe("Retail User Transfer Tokens to a valid Issuer crypto account - transfer function", async () => {
  it("Pass Retail user transfer tokens to issuer account", async () => {
    const { admin, minter, user2, validIssuerAccount, token } =
      await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 10);

    await token.connect(user2).transfer(validIssuerAccount.address, 2);
    // verify the balance
    expect(
      await token.connect(admin).balanceOf(validIssuerAccount.address)
    ).to.be.equal("2");
  });

  it("Should Revert when transfer amount exceeds the balance", async () => {
    const { admin, minter, user2, validIssuerAccount, token } =
      await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 10);

    let bal;
    await token
      .connect(admin)
      .balanceOf(user2.address)
      .then((result) => {
        bal = result.toNumber();
      });
    await expect(
      token.connect(user2).transfer(validIssuerAccount.address, bal + 1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should Revert Transfer when Paused", async () => {
    const { pauser, minter, token } = await loadFixture(deployTransferFixture);

    await token.connect(pauser).pause();

    await expect(
      token.connect(minter).transfer(minter.address, 2)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("Should Revert transfer when receiver is on transfer restriction list", async () => {
    const {
      tokenTransferController,
      minter,
      user2,
      validIssuerAccount,
      token,
    } = await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 10);

    await expect(
      token
        .connect(tokenTransferController)
        .restrictTransfers(validIssuerAccount.address)
    ).not.to.be.reverted;

    await expect(
      token.connect(user2).transfer(validIssuerAccount.address, 2)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });

  it("Should Revert transfer when sender is on transfer restriction list", async () => {
    const {
      tokenTransferController,
      minter,
      user2,
      validIssuerAccount,
      token,
    } = await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 10);

    await expect(
      token.connect(tokenTransferController).restrictTransfers(user2.address)
    ).not.to.be.reverted;

    await expect(
      token.connect(user2).transfer(validIssuerAccount.address, 2)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });
});

describe("Permissioned Retail User transfer Tokens to a valid Issuer crypto account - transferFrom function", async () => {
  it("Should Pass TransferFrom from user2 to validIssuerAccount", async () => {
    const { admin, minter, user1, user2, validIssuerAccount, token } =
      await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 20);

    await token.connect(user2).approve(user1.address, 20);

    // await truffleAssert.passes(token.transferFrom(user2, validIssuerAccount, 2, {from:user1,}));
    let receiverPBal, receiverABal, senderPBal, senderABal;
    await token
      .connect(admin)
      .balanceOf(validIssuerAccount.address)
      .then((result) => {
        receiverPBal = result.toNumber();
      });

    await token
      .connect(admin)
      .balanceOf(user2.address)
      .then((result) => {
        senderPBal = result.toNumber();
      });

    const tranferFromTX = await token
      .connect(user1)
      .transferFrom(user2.address, validIssuerAccount.address, 2);

    const result = await tranferFromTX.wait();
    expect(result.events[0].event).to.equal("Approval");
    expect(result.events[0].args[0]).to.equal(user2.address);
    expect(result.events[0].args[1]).to.equal(user1.address);
    // verify receiver balance
    await token
      .connect(admin)
      .balanceOf(validIssuerAccount.address)
      .then((result) => {
        receiverABal = result.toNumber();
      });
    assert.equal(receiverABal, receiverPBal + 2, "Valid balance of tokens");

    // verifiy sender balance
    await token
      .connect(admin)
      .balanceOf(user2.address)
      .then((result) => {
        senderABal = result.toNumber();
      });
    assert.equal(senderPBal - 2, senderABal, "Valid balance of tokens");
  });

  it("Should Revert when transferFrom amount exceeds the approved allowance", async () => {
    const { admin, minter, user1, user2, validIssuerAccount, token } =
      await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 20);

    await token.connect(user2).approve(user1.address, 20);

    let tokenAllowance;

    await token
      .connect(admin)
      .allowance(user2.address, user1.address)
      .then((result) => {
        tokenAllowance = result.toNumber();
      });

    await expect(
      token
        .connect(user1)
        .transferFrom(
          user2.address,
          validIssuerAccount.address,
          tokenAllowance + 1
        )
    ).to.be.revertedWith("ERC20: insufficient allowance");
  });

  it("Should Revert TransferFrom when Paused", async () => {
    const { minter, user1, user2, validIssuerAccount, pauser, token } =
      await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 20);

    await token.connect(user2).approve(user1.address, 20);

    await token.connect(pauser).pause();

    await expect(
      token
        .connect(user1)
        .transferFrom(user2.address, validIssuerAccount.address, 2)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("Should Revert transferFrom when validIssuerAccount is on transfer restriction list", async () => {
    const {
      minter,
      user1,
      user2,
      validIssuerAccount,
      tokenTransferController,
      token,
    } = await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 20);

    await token.connect(user2).approve(user1.address, 20);

    await token
      .connect(tokenTransferController)
      .restrictTransfers(validIssuerAccount.address);

    await expect(
      token
        .connect(user1)
        .transferFrom(user2.address, validIssuerAccount.address, 2)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });

  it("Should Revert transferFrom when sender is on transfer restriction list", async () => {
    const {
      minter,
      user1,
      user2,
      validIssuerAccount,
      tokenTransferController,
      token,
    } = await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 20);

    await token.connect(user2).approve(user1.address, 20);

    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    await expect(
      token
        .connect(user1)
        .transferFrom(user2.address, validIssuerAccount.address, 2)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });

  it("Should Revert transferFrom when owner is on transfer restriction list", async () => {
    const {
      minter,
      user1,
      user2,
      validIssuerAccount,
      tokenTransferController,
      token,
    } = await loadFixture(deployTransferFixture);

    await token.connect(minter).transfer(user2.address, 20);

    await token.connect(user2).approve(user1.address, 20);

    await token
      .connect(tokenTransferController)
      .restrictTransfers(user2.address);

    await expect(
      token
        .connect(user1)
        .transferFrom(user2.address, validIssuerAccount.address, 2)
    ).to.be.revertedWith(ADDRESS_DENIED_ERROR);
  });
});

describe("Test events - transferFrom User to validIssuerAccount", async () => {
  it("Should emit a transfer event", async () => {
    const { minter, user1, user2, validIssuerAccount, token } =
      await loadFixture(deployTransferFixture);
    await token.connect(minter).transfer(user2.address, 20);

    await token.connect(user2).approve(user1.address, 20);

    await expect(
      token
        .connect(user1)
        .transferFrom(user2.address, validIssuerAccount.address, 2)
    )
      .to.emit(token, "Transfer")
      .withArgs(user2.address, validIssuerAccount.address, 2);
  });
});
