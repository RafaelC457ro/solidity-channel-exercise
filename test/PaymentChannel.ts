import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  MockToken,
  PaymentChannel,
  PaymentChannelFactory,
} from "../typechain-types";

describe("PaymentChannel", () => {
  async function deployPaymentChannelFixture() {
    const { sender, receiver } = await ethers.getNamedSigners();
    const oneHour = 60 * 60;

    const expiration = (await time.latest()) + oneHour;
    await deployments.fixture(["all"]);

    // load MockToken
    const MockToken: MockToken = await ethers.getContract("MockToken");

    // mint tokens to sender
    const senderTokenBalance = 1000;
    await MockToken.mint(sender.address, 0, senderTokenBalance, "0x");

    const PaymentChannelFactory: PaymentChannelFactory =
      await ethers.getContract("PaymentChannelFactory");

    const tx = await PaymentChannelFactory.createPaymentChannel(
      sender.address,
      receiver.address,
      senderTokenBalance,
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
    const domain = {
      name: "PaymentChannel",
      version: "1.0.0",
      chainId: 31337,
      verifyingContract: PaymentChannel.address,
    } as const;

    const types = {
      Payment: [{ name: "amount", type: "uint256" }],
    };

    const value = {
      amount,
    } as const;

    const signature = await sender._signTypedData(domain, types, value);
    await PaymentChannel.connect(receiver).close(amount, signature);

    const receiverBalanceAfter = await MockToken.balanceOf(receiver.address, 0);
    const contractBalance = await MockToken.balanceOf(channel, 0);

    expect(receiverBalanceAfter).to.equal(receiverBalanceBefore.add(amount));
    expect(contractBalance.toString()).to.equal("0");
  });
});
