// While the other unit test is meant for the local testing the staging test is meant for the testing in a testnet
const { assert } = require("chai")
const {getNamedAccounts, ethers, network} = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")
// Writing a ternary operator
developmentChains.includes(network.name) ? describe.skip //will skip the following testing as this is a staging test
:describe("FundMe",async()=>{
    let fundMe
    let deployer
    const sendValue = ethers.utils.parseEthers("1")
    beforeEach(async()=>{
        /*
            Assume that the contract is alreay deployed and has mock
            Therefore no need to redeploy t hem
        */
        deployer = (await getNamedAccounts()).deployer //fetch deployer from .config
        fundMe = await ethers.getContract("FundMe",deployer) //fetch the deployed contract and connet with the deployer
    })
    it("allows people to fund and withdraw",async()=>{
        await fundMe.fund({value: sendValue})
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(
            fundMe.address
        )
        assert.equal(endingBalance.toString(),0)
    })
})