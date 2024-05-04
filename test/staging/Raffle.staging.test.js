const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle unit tests", function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              const raffleDeployment = await deployments.get("Raffle")
              raffle = await ethers.getContractAt(raffleDeployment.abi, raffleDeployment.address)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with chainlink keepers, and chainlink VRF", async function () {
                  const startingTimestamp = raffle.getLatestTimestamp()
                  const accounts = await ethers.getSigners()
                  let winnerAccount = accounts[0].address
                  let winnerStartingBalance

                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired")
                          try {
                              const winner = await raffle.getRecentWinner()
                              const endingTimestamp = await raffle.getLatestTimestamp()
                              const raffleState = await raffle.getRaffleState()
                              //   const winnerEndingBalance =
                              //       await ethers.provider.getBalance(winnerAccount)
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(winner, winnerAccount)
                              assert.equal(raffleState, 0)
                              //   assert.equal(
                              //       winnerEndingBalance,
                              //       winnerStartingBalance + raffleEntranceFee,
                              //   )
                              //   assert(endingTimestamp > startingTimestamp)

                              resolve()
                          } catch (error) {
                              reject(error)
                          }
                      })
                      const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
                      console.log(upkeepNeeded)
                      try {
                          await raffle.performUpkeep("0x")
                      } catch (error) {
                          console.log(error)
                      }
                      // await raffle.enterRaffle({ value: raffleEntranceFee })
                      // winnerStartingBalance = await ethers.provider.getBalance(winnerAccount)
                  })
              })
          })
      })
