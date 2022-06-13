const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {assert,expect} = require("chai")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const {developmentChains} = require("../../helper-hardhat-config")
/*
    The testing pattern which we use here is an iterative pattern where the names don't mean much but the beforeEach and it
    all the logic which are present inside it are important rest are to give a structure and the order of execution of the 
    tests
*/
// Iterative tests for each individual units
// Ternary operator with negation will run reverswe if it is a dev chain 
!developmentChains.includes(network.name) ? describe.skip //will run the following testing as this is a development test
: describe("FundMe", async () => { //main describe for the FundMe contract
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")//converts into ethers i.e 1^18
    // Before any of the test we have to deploy our contracts
    beforeEach(async () => {
        // deploying FundMe contract using hardhat-deploy
        // Fixtures allow us to run the entire deploy folder with as many tags as we want
        deployer = (await getNamedAccounts()).deployer //will provide the default account according to the chainId from .config file
        // Alternative way to fetch the accounts:
        // const accounts = await ethers.getSigners() //returns the list of accounts according to the network
        await deployments.fixture(["all"]) //since both of the deploy have the tags of all then it will run all of them
        fundMe = await ethers.getContract("FundMe",deployer) //provides the most recently deployed FundMe contract after it has been deployed
        // from the deployer account, here the ethers function is added with additional functionalities by the hardhat
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer)//gets the deployed mock address
    })
    // Unit test for constructor
    describe("constructor",async ()=>{ //checks if the constructor was able to set the priceFeed contract correctly
        it("sets the aggregator address correctly",async()=>{
            const response = await fundMe.getPriceFeed() //has address of the priceFeed
            assert.equal(response,mockV3Aggregator.address)
        })
    })
    // Unit test for fund()
    describe("fund",async()=>{
        it("Fails if not enough ETH are sent",async()=>{
            await expect (fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")//here expec is overridden by waffle
        })
        it("updated the amount funded data structure",async()=>{
            await fundMe.fund({value: sendValue})//calls the fund() with the ETH amount
            const response = await fundMe.getAddressToAmountFunded(deployer)//fetches deployer's funded amount from the mapping
            assert.equal(response.toString(),sendValue.toString())
        })
        it("adds funder to array of funders",async()=>{
            await fundMe.fund({value: sendValue})
            const funder = await fundMe.getFunder(0)
            assert.equal(funder,deployer)
        })
    })
    // Unit test for withdraw()
    describe("withdraw", async()=>{
        // Since before testing the withdraw() we have to ensure that there is some amount
        beforeEach(async()=>{ //sending ETH before testing the withdraw()
            await fundMe.fund({value: sendValue})
        })
        it("withdraw ETH from a single funder",async()=>{
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)//value with contract after being funded
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)//initial value of deployer
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed,effectiveGasPrice} = transactionReceipt//fetching the gas used and the price per gas
            const gasCost = gasUsed.mul(effectiveGasPrice)//since BigNumber datatype using mul instead of *
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            // Assert
            assert.equal(endingFundMeBalance,0)
            assert.equal( //since BigData so instead of = we use add 
                startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString()
            )
        })
        it("allows us to withdraw with multiple funders",async()=>{
            // Arrange
            // get multiple accounts from hardhat anf fund your contract
            const accounts = await ethers.getSigners()
            // loop through each of the accounts in the array and send monety to the contract
            for(i=1;i<6;i++){//starts with 1 since 0 will be the deployers address
                // since during deployment our fundMe is connected with the deployer here we connect with the funders
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            // Act
             const transactionResponse = await fundMe.withdraw()
             const transactionReceipt = await transactionResponse.wait(1)
             const {gasUsed,effectiveGasPrice} = transactionReceipt
             const gasCost = gasUsed.mul(effectiveGasPrice)
            //  Assert
             const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
             const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
             assert.equal(endingFundMeBalance,0)
             assert.equal(startingFundMeBalance.add(startingDeployerBalance),endingDeployerBalance.add(gasCost).toString())
        
            // Make sure that the funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted//since they would have been removed from the array
            // loop through all of the funders to check if they are removed
            // we expect their amount to be 0 since we are resetting them
            for(i=1;i<6;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
            }
        })
        // testing the cheaper variant of the withdraw function
        it("cheaper withdraw testing ...",async()=>{
            // Arrange
            // get multiple accounts from hardhat anf fund your contract
            const accounts = await ethers.getSigners()
            // loop through each of the accounts in the array and send monety to the contract
            for(i=1;i<6;i++){//starts with 1 since 0 will be the deployers address
                // since during deployment our fundMe is connected with the deployer here we connect with the funders
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            // Act
             const transactionResponse = await fundMe.cheaperWithdraw()
             const transactionReceipt = await transactionResponse.wait(1)
             const {gasUsed,effectiveGasPrice} = transactionReceipt
             const gasCost = gasUsed.mul(effectiveGasPrice)
            //  Assert
             const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
             const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
             assert.equal(endingFundMeBalance,0)
             assert.equal(startingFundMeBalance.add(startingDeployerBalance),endingDeployerBalance.add(gasCost).toString())
        
            // Make sure that the funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted//since they would have been removed from the array
            // loop through all of the funders to check if they are removed
            // we expect their amount to be 0 since we are resetting them
            for(i=1;i<6;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
            }
        })
        it("only allows the owner to withdraw",async()=>{
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")
        })
    })
})