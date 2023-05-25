import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // deploy PaymentChannel
  await deploy("PaymentChannel", {
    from: deployer,
    args: [],
    log: true,
  });
};

deployment.tags = ["all", "mock-token"];

export default deployment;
