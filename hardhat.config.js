const { version } = require("chai");

require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
/*
  Plugin to deploy scripts from cmdline directly, when overridden this will give ability to keep track of deployed contracts
  This will furtther be overwritten by @nomiclabs/hardhat-deploy-ethers
  Have to create the new deploy folder which this plugin will monitor to deploy the SmartContracts
*/
require("hardhat-deploy")
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.7" },
      { version: "0.6.6" }
    ]
  },
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6 //no of blocks to wait for the transaction to be completed, also has to be mentioned during the deploy func
    }
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: "INR",
    token: "MATIC"
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  // Naming the spots in the accounts array
  namedAccounts: {
    deployer: {
      // The default deployer is 0
      default: 0,
      // In Rinkeby the deployer is 1
      4: 0
    }
  }
};
