import { HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "solidity-coverage";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      gas: 2100000,
      gasPrice: 8000000000,
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      chainId: 5,
    },
    sepolia: {
      url: process.env.SEFOLIA_RPC_URL!,
      accounts: [
        process.env.PRIVATE_KEY!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    token: "MATIC",
    coinmarketcap: process.env.CAINMARKETCAP_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    sender: {
      default: 1,
    },
    receiver: {
      default: 3,
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_GOERLI_KEY!,
    },
  },
  mocha: {
    timeout: 600000,
  },
};

export default config;
