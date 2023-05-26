import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const paymentChannelImplementation = await deployments.get("PaymentChannel");

  await deploy("PaymentChannelFactory", {
    from: deployer,
    args: [paymentChannelImplementation.address],
    log: true,
  });
};

deployment.tags = ["all", "payment-channel-factory"];

export default deployment;
