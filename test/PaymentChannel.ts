import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  MockToken,
  PaymentChannel,
  PaymentChannelFactory,
} from "../typechain-types";
import { createPaymentSignature } from "../utils/createPaymentSignature";

describe("PaymentChannel", () => {
  async function deployPaymentChannelFixture() {
    const { deployer, sender, receiver } = await ethers.getNamedSigners();
    const oneHour = 60 * 60;

    const expiration = (await time.latest()) + oneHour;
    await deployments.fixture(["all"]);

    // load MockToken
    const MockToken: MockToken = await ethers.getContract("MockToken");
    // call onERC1155BatchReceived

    // mint tokens to sender
    const senderTokenBalance = 1000;
    await MockToken.mint(sender.address, 0, senderTokenBalance, "0x");

    const PaymentChannelFactory: PaymentChannelFactory =
      await ethers.getContract("PaymentChannelFactory");

    const tx = await PaymentChannelFactory.createPaymentChannel(
      sender.address,
      receiver.address,
      expiration,
      MockToken.address,
      0
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find(
      (e) => e.event === "PaymentChannelCreated"
    );

    const channel = event?.args?.paymentChannel;

    // sent tokens to PaymentChannel
    await MockToken.connect(sender).safeTransferFrom(
      sender.address,
      channel,
      0,
      senderTokenBalance,
      "0x"
    );

    return {
      channel,
      PaymentChannelFactory,
      sender,
      receiver,
      MockToken,
      expiration,
      deployer,
    };
  }

  it("should create and close a channel", async () => {
    const { channel, sender, receiver, MockToken } = await loadFixture(
      deployPaymentChannelFixture
    );

    const receiverBalanceBefore = await MockToken.balanceOf(
      receiver.address,
      0
    );
    const contractBalanceBefore = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceBefore.toString()).to.equal("0");
    expect(contractBalanceBefore.toString()).to.equal("1000");

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    const amount = 1000;
    const signature = await createPaymentSignature(sender, channel, amount);

    expect(PaymentChannel.connect(receiver).close(amount, signature))
      .to.emit(PaymentChannel, "PaymentClosed")
      .withArgs(amount);

    const receiverBalanceAfter = await MockToken.balanceOf(receiver.address, 0);
    const contractBalance = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceAfter).to.equal(receiverBalanceBefore.add(amount));
    expect(contractBalance.toString()).to.equal("0");
  });

  it("should not close a channel with an invalid signature", async () => {
    const { channel, deployer, receiver, MockToken } = await loadFixture(
      deployPaymentChannelFixture
    );

    const receiverBalanceBefore = await MockToken.balanceOf(
      receiver.address,
      0
    );
    const contractBalanceBefore = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceBefore.toString()).to.equal("0");
    expect(contractBalanceBefore.toString()).to.equal("1000");

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    const amount = 1000;
    const signature = await createPaymentSignature(deployer, channel, amount);

    await expect(
      PaymentChannel.connect(receiver).close(amount, signature)
    ).to.be.revertedWith("PaymentChannel: invalid signature");

    const receiverBalanceAfter = await MockToken.balanceOf(receiver.address, 0);
    const contractBalance = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceAfter.toString()).to.equal("0");
    expect(contractBalance.toString()).to.equal("1000");
  });

  it("should not close a channel with an invalid amount", async () => {
    const { channel, sender, receiver, MockToken } = await loadFixture(
      deployPaymentChannelFixture
    );

    const receiverBalanceBefore = await MockToken.balanceOf(
      receiver.address,
      0
    );
    const contractBalanceBefore = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceBefore.toString()).to.equal("0");
    expect(contractBalanceBefore.toString()).to.equal("1000");

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    const amount = 999;
    const signature = await createPaymentSignature(sender, channel, 1000);

    await expect(
      PaymentChannel.connect(receiver).close(amount, signature)
    ).to.be.revertedWith("PaymentChannel: invalid signature");

    const receiverBalanceAfter = await MockToken.balanceOf(receiver.address, 0);
    const contractBalance = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceAfter.toString()).to.equal("0");
    expect(contractBalance.toString()).to.equal("1000");
  });

  it("should not close a channel after expiration", async () => {
    const { channel, sender, receiver, MockToken, expiration } =
      await loadFixture(deployPaymentChannelFixture);

    const receiverBalanceBefore = await MockToken.balanceOf(
      receiver.address,
      0
    );
    const contractBalanceBefore = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceBefore.toString()).to.equal("0");
    expect(contractBalanceBefore.toString()).to.equal("1000");

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    const amount = 1000;
    const signature = await createPaymentSignature(sender, channel, amount);

    await time.increaseTo(expiration + 1);

    await expect(
      PaymentChannel.connect(receiver).close(amount, signature)
    ).to.be.revertedWith("PaymentChannel: payment is expired");

    const receiverBalanceAfter = await MockToken.balanceOf(receiver.address, 0);
    const contractBalance = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceAfter.toString()).to.equal("0");
    expect(contractBalance.toString()).to.equal("1000");
  });

  it("should cancel the payment after expiration", async () => {
    const { channel, sender, MockToken, expiration } = await loadFixture(
      deployPaymentChannelFixture
    );

    const senderBalanceBefore = await MockToken.balanceOf(sender.address, 0);
    const contractBalanceBefore = await MockToken.balanceOf(channel, 0);

    expect(contractBalanceBefore.toString()).to.equal("1000");
    expect(senderBalanceBefore.toString()).to.equal("0");

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    await time.increaseTo(expiration + 1000);

    await expect(PaymentChannel.connect(sender).cancel()).to.emit(
      PaymentChannel,
      "PaymentCanceled"
    );

    const senderBalanceAfter = await MockToken.balanceOf(sender.address, 0);
    const contractBalanceAfter = await MockToken.balanceOf(channel, 0);

    expect(senderBalanceAfter.toString()).to.equal("1000");
    expect(contractBalanceAfter.toString()).to.equal("0");
  });

  it("should not cancel the payment before expiration", async () => {
    const { channel, sender } = await loadFixture(deployPaymentChannelFixture);

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    await expect(PaymentChannel.connect(sender).cancel()).to.be.revertedWith(
      "PaymentChannel: payment is not expired"
    );
  });

  it("should not cancel the payment by a third party", async () => {
    const { channel, receiver, expiration } = await loadFixture(
      deployPaymentChannelFixture
    );

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    await time.increaseTo(expiration + 1000);

    await expect(PaymentChannel.connect(receiver).cancel()).to.be.revertedWith(
      "PaymentChannel: only sender can cancel"
    );
  });

  it("should not close the payment by a third party", async () => {
    const { channel, sender, deployer } = await loadFixture(
      deployPaymentChannelFixture
    );

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    const amount = 1000;
    const signature = await createPaymentSignature(sender, channel, amount);

    expect(
      PaymentChannel.connect(deployer).close(amount, signature)
    ).revertedWith("PaymentChannel: only receiver can close");
  });

  it("should not be able to initialize twice", async () => {
    const { channel, sender, receiver, MockToken } = await loadFixture(
      deployPaymentChannelFixture
    );

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    expect(
      PaymentChannel.initialize(
        sender.address,
        receiver.address,
        (await time.latest()) + 1000,
        MockToken.address,
        0
      )
    ).to.be.revertedWith("PaymentChannel: already initialized");
  });

  it("should transfer the remaining balance to the sender", async () => {
    const { channel, sender, receiver, MockToken } = await loadFixture(
      deployPaymentChannelFixture
    );

    const PaymentChannel: PaymentChannel = await ethers.getContractAt(
      "PaymentChannel",
      channel
    );

    const amount = 500;
    const signature = await createPaymentSignature(sender, channel, amount);

    await PaymentChannel.connect(receiver).close(amount, signature);

    const senderBalanceAfter = await MockToken.balanceOf(sender.address, 0);
    const receiverBalance = await MockToken.balanceOf(receiver.address, 0);

    expect(senderBalanceAfter.toString()).to.equal("500");
    expect(receiverBalance.toString()).to.equal("500");
  });
});
