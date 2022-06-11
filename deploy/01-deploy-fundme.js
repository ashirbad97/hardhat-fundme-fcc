/*

    Duplicate from .config file: 
    Plugin to deploy scripts from cmdline directly, when overridden this will give ability to keep track of deployed contracts
    This will furtther be overwritten by @nomiclabs/hardhat-deploy-ethers

    Have to create the new deploy folder which this plugin will monitor to deploy the SmartContracts
    Instead of creating and calling a main function for a script, we can define a function and add it as a default function to run
    when the script has been called using hardhat deploy
    The idea to do this is when we deploy using scripts we have to deploy each time the script runs or edit the script each time
    Also we don't get to keep a track of the deployed scripts which we can now be able to keep a track and interact with

    So essentially when we run the deploy command it will look for into the deploy directory and run the scripts and keep tab of it

    N.B: When we run the hardhat node the scripts in the deploy folder are automatically deployed

    utils: this dir is created as a syntactic method to modularize our code and put all the logic that are helper functions for the
    deployment into a seperate folder and access from it

    N.B: Similar to how we take various properties from the .config.js file for hardhat we have created an additional helper file 
    difference is hardhat can read it's own config file directly but for our use from the helper file we need to import 
    it and use it manually
    
*/

// deployFunc = async (hre) => { }
// Designates the default function to run when we run the script
// module.exports.default = deployFunc

// Instead we can define this in an anonymous function

// module.exports = async (hre)=>{
//     // Destructuring objects from hre
//     const {getNamedAccounts, deployments} = hre
// }
const { network } = require("hardhat")
//returns a js object to map the address of AggregatorV3 address in different chains
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
// Alternative to the above statement we can use the syntactic sugar to destructure at the argument level itself

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() //fetch the named accounts from the .config file, used to name the account as reference
    const chainId = network.config.chainId //fetch the chainId from hardhat
    /*
        When deploying on localhost or hardhat network we use a mock
    */
    // check if development environment or not 
    if (developmentChains.includes(network.name)) { //check if it's a dev network or not
        // if dev network then fetch the mockv3 aggregator
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address //fetch address of the deployed mock
    } else {
        // if not on a dev chain
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] //accessing values from the passed js object as network config
    }
    const args = [ethUsdPriceFeedAddress]
    // Deploying a contract
    // Instead of using a contractFactory we can deploy it right away
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //priceFeed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    // verify the smart contract if the network is not a development environment and the etherscan api key is setup for verifying it
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }
}
// tags are required since we are using a deploy function to run the scripts in the deploy dir
// so using this we can specify which of the script do we actually need to run
module.exports.tags = ["all", "fundme"]