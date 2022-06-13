const { getNamedAccounts, ethers } = require("hardhat")

main = async ()=>{
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe",deployer)
    console.log("Funding ...")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("withdraw funds done")
}

main().then(()=>{
    // if the then means promise resolved so quit process with success code
    process.exit(0)
}).catch((error)=>{
    // Handling errors if we faced any
    console.log(error)
    process.exit(1)
})