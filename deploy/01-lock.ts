import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  //   const chainId = network.config.chainId;

  //   const isLocalTest = chainId === 31337;

  //   if (isLocalTest) {

  //   }

  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.utils.parseEther("0.001");

  deploy("Lock", {
    from: deployer,
    args: [unlockTime],
    value: lockedAmount,
    log: true,
  });

  log("---------------------------------------------------------");
};

deployment.tags = ["all", "lock"];

export default deployment;
