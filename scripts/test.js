const { getNamedAccounts, network, deployments, ethers } = require("hardhat")

async function main() {
    let raffle, vrfCoordinatorV2Mock, raffleEntranceFee
    const chainId = network.config.chainId

    const { deployer } = getNamedAccounts()
    await deployments.fixture(["all"])
    const raffleDeployment = await deployments.get("Raffle")
    raffle = await ethers.getContractAt(raffleDeployment.abi, raffleDeployment.address)
    const vrfCoordinatorV2MockDeployment = await deployments.get("VRFCoordinatorV2Mock")
    vrfCoordinatorV2Mock = await ethers.getContractAt(
        vrfCoordinatorV2MockDeployment.abi,
        vrfCoordinatorV2MockDeployment.address,
    )
    raffleEntranceFee = await raffle.getEntranceFee()
    // Ideally only one assert per "it" but we're having several here
    const raffleState = await raffle.getRaffleState()

    const interval = await raffle.getInterval()

    const enterRaffleResponse = await raffle.enterRaffle({ value: raffleEntranceFee })
    const enterRaffleReceipt = await enterRaffleResponse.wait(1)
    console.log(enterRaffleReceipt.logs[0].eventName)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
