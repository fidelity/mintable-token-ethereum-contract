const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const { deployTokenFixtureWithRoles } = require("./shared-setup");
const mintAllocationAmount = 1000;

describe("Verify Token transfer to a wallet address", async () => {
  it("Verify token transfer from an Issuer account to a token holder's own wallet", async () => {
    const { validIssuerAccount, holderWallet, mintAllocator, minter, token } =
      await loadFixture(deployTokenFixtureWithRoles);

    // Get holder's initial balance
    const holderInitialBalance = parseInt(
      await token.connect(holderWallet).balanceOf(holderWallet.address)
    );

    // Get issuer initial balance
    const issuerInitialBalance = parseInt(
      await token
        .connect(validIssuerAccount)
        .balanceOf(validIssuerAccount.address)
    );

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, mintAllocationAmount);

    // Mint tokens to Issuer Account
    await token
      .connect(minter)
      .mint(validIssuerAccount.address, mintAllocationAmount);

    // Transfer tokens to holder
    await token
      .connect(validIssuerAccount)
      .transfer(holderWallet.address, mintAllocationAmount);

    // Verify all minted tokens transferred from validIssuerAccount
    const issuerFinalBalance = parseInt(
      await token
        .connect(validIssuerAccount)
        .balanceOf(validIssuerAccount.address)
    );
    assert.equal(issuerFinalBalance, issuerInitialBalance);

    // Verify tokens transferred to holderWallet_ADDRESS
    const holderFinalBalance = parseInt(
      await token.connect(holderWallet).balanceOf(holderWallet.address)
    );
    assert.equal(
      holderFinalBalance,
      holderInitialBalance + mintAllocationAmount
    );
  });

  // Unhappy paths - transfer to wallet address
  it("Revert transfer when paused", async () => {
    const {
      pauser,
      validIssuerAccount,
      holderWallet,
      mintAllocator,
      minter,
      token,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, mintAllocationAmount);

    // Mint tokens to Issuer account
    await token
      .connect(minter)
      .mint(validIssuerAccount.address, mintAllocationAmount);

    // Pause contract
    await token.connect(pauser).pause();

    // Transfer should revert
    await expect(
      token
        .connect(validIssuerAccount)
        .transfer(holderWallet.address, mintAllocationAmount)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("Revert transfer when token sender is transfer restricted", async () => {
    const {
      tokenTransferController,
      validIssuerAccount,
      holderWallet,
      mintAllocator,
      minter,
      token,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, mintAllocationAmount);

    // Mint tokens to Issuer account
    await token
      .connect(minter)
      .mint(validIssuerAccount.address, mintAllocationAmount);

    // Restrict transfers of Issuer account
    await token
      .connect(tokenTransferController)
      .restrictTransfers(validIssuerAccount.address);

    // Transfer should revert
    await expect(
      token
        .connect(validIssuerAccount)
        .transfer(holderWallet.address, mintAllocationAmount)
    ).to.be.revertedWith(
      "Restrictable: Unable to transfer to or from addresses on transfer restriction list"
    );
  });

  it("Revert transfer when wallet/receiver is transfer restricted", async () => {
    const {
      tokenTransferController,
      validIssuerAccount,
      holderWallet,
      mintAllocator,
      minter,
      token,
    } = await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, mintAllocationAmount);

    // Mint tokens to Issuer account
    await token
      .connect(minter)
      .mint(validIssuerAccount.address, mintAllocationAmount);

    // Restrict transfers of receiver account
    await token
      .connect(tokenTransferController)
      .restrictTransfers(holderWallet.address);

    // Transfer should revert
    await expect(
      token
        .connect(validIssuerAccount)
        .transfer(holderWallet.address, mintAllocationAmount)
    ).to.be.revertedWith(
      "Restrictable: Unable to transfer to or from addresses on transfer restriction list"
    );
  });

  it("Revert when transfer amount exceeds balance", async () => {
    const { validIssuerAccount, holderWallet, mintAllocator, minter, token } =
      await loadFixture(deployTokenFixtureWithRoles);

    await token
      .connect(mintAllocator)
      .increaseMintAllocation(minter.address, mintAllocationAmount);

    // Mint tokens to Issuer Account
    await token
      .connect(minter)
      .mint(validIssuerAccount.address, mintAllocationAmount);

    // find the balance before token transfer
    const initialBalance = parseInt(
      await token
        .connect(validIssuerAccount)
        .balanceOf(validIssuerAccount.address)
    );

    // transfer tokens more than the balance
    await expect(
      token
        .connect(validIssuerAccount)
        .transfer(holderWallet.address, initialBalance + 1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });
});
