import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PaymentChannel", () => {
  async function deployPaymentChannelFixture() {
    const { sender, receiver } = await ethers.getNamedSigners();
    const one_month = 30 * 24 * 60 * 60;

    const expiration = (await time.latest()) + one_month;
    await deployments.fixture(["all"]);

    // load MockToken
    const MockToken = await ethers.getContract("MockToken");

    // mint tokens to sender
    const senderTokenBalance = 1000;
    await MockToken.mint(sender.address, senderTokenBalance);

    const PaymentChannelFactory = await ethers.getContract(
      "PaymentChannelFactory"
    );

    await PaymentChannelFactory.createChannel(
      receiver.address,
      MockToken.address,
      senderTokenBalance,
      expiration
    );
  }
});
