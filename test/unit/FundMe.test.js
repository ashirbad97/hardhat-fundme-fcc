const { deployments } = require("hardhat")

describe("FundMe", async () => {
    let fundMe
    // Before any of the test we have to deploy our contracts
    beforeEach(async () => {
        // deploying FundMe contract using hardhat-deploy
        // Fixtures allow us to run the entire deploy folder with as many tags as we want
        await deployments.fixture(["all"]) //since both of the deploy have the tags of all then it will run all of them
    })
    // Unit test for constructor

})