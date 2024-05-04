const { developmentChains } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")

const BASE_FEE = ethers.parseUnits("0.25")
const GAS_PRICE_LINK = 1e9

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Deploying to a development chain, deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            args: args,
            log: true,
        })
        log("Mocks deployed !")
        log("---------Big separator to know we're out of mock deployment---------")
    }
}

module.exports.tags = ["all", "mocks"]
