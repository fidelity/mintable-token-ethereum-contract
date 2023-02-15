const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const {
  deployTokenFixtureWithRoles,
  tokenTransferControllerRole,
} = require("./shared-setup");

describe("Restricting Transfers", async () => {
  it("Should restrictTransfers", async () => {
    const { admin, tokenTransferController, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    expect(
      await token.connect(admin).isTransferRestrictionImposed(user1.address)
    );
  });

  it("Should revert when not the tokenTransferController", async () => {
    const { user1, token } = await loadFixture(deployTokenFixtureWithRoles);
    await expect(
      token.connect(user1).restrictTransfers(user1.address)
    ).to.be.revertedWith(
      `AccessControl: account ${user1.address.toLowerCase()} is missing role ${tokenTransferControllerRole.toLocaleLowerCase()}`
    );
  });

  it("Should emit TransferRestrictionImposed event", async () => {
    const { tokenTransferController, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await expect(
      token.connect(tokenTransferController).restrictTransfers(user1.address)
    )
      .to.emit(token, "TransferRestrictionImposed")
      .withArgs(user1.address);
  });
});

describe("Verify unrestrictTransfers", async () => {
  it("Should unrestrictTransfers", async () => {
    const { tokenTransferController, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    await token
      .connect(tokenTransferController)
      .unrestrictTransfers(user1.address);

    expect(await token.isTransferRestrictionImposed(user1.address)).to.equal(
      false
    );
  });

  it("Should revert when not the tokenTransferController", async () => {
    const { user1, token } = await loadFixture(deployTokenFixtureWithRoles);
    await expect(
      token.connect(user1).unrestrictTransfers(user1.address)
    ).to.be.revertedWith(
      `AccessControl: account ${user1.address.toLowerCase()} is missing role ${tokenTransferControllerRole.toLocaleLowerCase()}`
    );
  });
  it("Should emit TransferRestrictionRemoved event", async () => {
    const { tokenTransferController, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await expect(
      token.connect(tokenTransferController).unrestrictTransfers(user1.address)
    )
      .to.emit(token, "TransferRestrictionRemoved")
      .withArgs(user1.address);
  });
});

describe("Verify getTransferRestrictionCount", (async) => {
  it("Should getTransferRestrictionCount", async () => {
    const { admin, tokenTransferController, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    await expect(token.connect(admin).getTransferRestrictionCount()).not.to.be
      .reverted;
  });
  it("getTransferRestrictionCount should increment and decrement", async () => {
    const { admin, tokenTransferController, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    // Add an address to the list
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    // Check count has increased
    let transferRestrictionCount = await token
      .connect(admin)
      .getTransferRestrictionCount();

    expect(1, transferRestrictionCount);

    // Remove an address from the list
    // Add an address to the list
    await token
      .connect(tokenTransferController)
      .unrestrictTransfers(user1.address);

    // Check count has decreased
    transferRestrictionCount = await token
      .connect(admin)
      .getTransferRestrictionCount();
    expect(0, transferRestrictionCount);
  });
});

describe("Verify getTransferRestriction", (async) => {
  it("Should getTransferRestriction", async () => {
    const { admin, tokenTransferController, user1, token } = await loadFixture(
      deployTokenFixtureWithRoles
    );
    // Add an address to the list
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    const firstTransferRestriction = await token
      .connect(admin)
      .getTransferRestriction(0);

    expect(user1.address, firstTransferRestriction);
  });

  it("getTransferRestriction should remove an address and shift the array", async () => {
    const { admin, tokenTransferController, user1, user2, token } =
      await loadFixture(deployTokenFixtureWithRoles);
    // Add an address to the list
    await token
      .connect(tokenTransferController)
      .restrictTransfers(user1.address);

    await token
      .connect(tokenTransferController)
      .restrictTransfers(user2.address);

    // Check positions are correct
    expect(user1.address, await token.connect(admin).getTransferRestriction(0));

    expect(user2.address, await token.connect(admin).getTransferRestriction(1));

    // Remove a user
    await token
      .connect(tokenTransferController)
      .unrestrictTransfers(user1.address);

    // Check that the address was removed, and other addresses were shifted in our list
    expect(user2.address, await token.connect(admin).getTransferRestriction(0));
  });
});
