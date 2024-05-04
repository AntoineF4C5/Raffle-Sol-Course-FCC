const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2PlusAddress, subscriptionId, vrfCoordinatorV2PlusMock
    const VRF_SUB_FUND_AMOUNT = ethers.parseUnits("30")

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2PlusMockDeployment = await deployments.get("VRFCoordinatorV2Mock")
        vrfCoordinatorV2PlusAddress = vrfCoordinatorV2PlusMockDeployment.address
        vrfCoordinatorV2PlusMock = await ethers.getContractAt(
            vrfCoordinatorV2PlusMockDeployment.abi,
            vrfCoordinatorV2PlusMockDeployment.address,
        )

        const transactionResponse = await vrfCoordinatorV2PlusMock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.logs[0].args.subId
        await vrfCoordinatorV2PlusMock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2PlusAddress = networkConfig[chainId]["vrfCoordinatorV2Plus"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]

    const args = [
        vrfCoordinatorV2PlusAddress,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        blockConfirmations: network.config.blockConfirmations || 1,
    })

    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2PlusMock.addConsumer(subscriptionId, raffle.address)

        log("Consumer is added")
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args)
    }
}

module.exports.tags = ["all", "raffle"]
