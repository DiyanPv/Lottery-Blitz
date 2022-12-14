const { getNamedAccounts, deployments, ethers } = require("hardhat");
require("@nomiclabs/hardhat-ethers");
const { assert, expect } = require(`chai`);
const { describe, beforeEach, it } = require("mocha");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", async () => {
      let raffle, vrfCoordinatorV2Mock, vrfCoordinatorAddress, chainId;
      chainId = network.config.chainId;
      const entranceFee = networkConfig[chainId].entranceFee;

      // let contractAddress = ethers.getContractFactory("Raffle");
      // vrfCoordinatorAddress = ethers.getContractFactory("VRFCoordinatorV2Mock");
      beforeEach(async () => {
        const { deployer } = await getNamedAccounts();
        await deployments.fixture(["all"]);
        const raffleAddress = await deployments.get("Raffle");
        const vrfCoordinatorAddress = await deployments.get(
          "VRFCoordinatorV2Mock"
        );
        const vrfCoordinatorV2Mock = await ethers.getContractAt(
          vrfCoordinatorAddress.abi,
          vrfCoordinatorAddress.address
        );
        raffle = await ethers.getContractAt(
          raffleAddress.abi,
          raffleAddress.address
        );
      });

      describe("Test constructor", async () => {
        it("Initializes Raffle Contract", async () => {
          console.log(raffle);
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();
          assert.equal(raffleState.toString(), `0`);
          assert.equal(interval, networkConfig[chainId].interval);
        });
      });
      describe(`Enter Raffle Test`, async () => {
        it(`Reverts when you do not pay enough`, async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            `Raffle__SendMoreToEnterRaffle`
          );
        });
        it(`Emits an event when entered`, async () => {
          await expect(raffle.enterRaffle({ value: entranceFee })).to.emit(
            raffle,
            `RaffleEnter`
          );
        });
      });
    });
