import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;
  const isLocalTest = chainId === 31337;
  if (isLocalTest) {
    await deploy("MockToken", {
      from: deployer,
      args: [],
      log: true,
    });
  }
};

deployment.tags = ["all", "mock-token"];

export default deployment;
