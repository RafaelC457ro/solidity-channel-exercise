import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  //  payment channel implementation
  const paymentChannelImplementation = await deployments.get("PaymentChannel");

  // deploy PaymentChannel
  await deploy("PaymentChannelFactory", {
    from: deployer,
    args: [paymentChannelImplementation.address],
    log: true,
  });
};

deployment.tags = ["all", "mock-token"];

export default deployment;
