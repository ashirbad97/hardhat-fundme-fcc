// Although we have dopne these fundtions in the test section but the purpose there was different
// Here our objective is to simply write scripts to interact with the deployed smart contract
const {getNamedAccounts, ethers} = require("hardhat")
main = async ()=>{
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe",deployer)
    console.log("Funding Contract .... ")
    const transactionResponse = await fundMe.fund({value: ethers.utils.parseEther("0.1")})
    const transactionReceipt = transactionResponse.wait("0.1")
    console.log("Funded !! ")
}
main().then(()=>{
    process.exit(0)
}).catch((error)=>{
    console.log(error)
    process.exit(1)
})