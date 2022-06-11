/* 

Deploying mocks for AggregatorV3Interface: i.e deploying the aggregator script in our localchain 

*/
const { network } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")
module.exports = async () => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() //fetch the named accounts from the .config file, used to name the account as reference
    const chainId = network.config.chainId //fetch the chainId from hardhat
    // if it is not a development chain then we need to deploy the mock AggregatorV3
    if (developmentChains.includes(network.name)) {
        log("Local Network Detected! Deploying Mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator", //to explicitly specify the solidity file
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]//constructor arguments for the AggregatorV3
        })
        log("Mock Deployed ----------------------------------------------------")
    }
}
// tags are required since we are using a deploy function to run the scripts in the deploy dir
// so using this we can specify which of the script do we actually need to run
module.exports.tags = ["all", "mocks"]