const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
require("dotenv").config();

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  const gasLane = networkConfig[chainId].gasLane;
  const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther(`1`);
  const { deployer } = await getNamedAccounts();
  const interval = networkConfig[chainId].interval;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  let vrfCoordinatorAddress, subscriptionId;
  if (developmentChains.includes(network.name)) {
    const myContract = await deployments.get("VRFCoordinatorV2Mock");
    const vrfCoordinatorV2Mock = await ethers.getContractAt(
      myContract.abi,
      myContract.address
    );
    vrfCoordinatorAddress = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorAddress = network.config.chainId.vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }
  const entranceFee = networkConfig[chainId].entranceFee;
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [
      vrfCoordinatorAddress,
      subscriptionId,
      gasLane,
      interval,
      entranceFee,
      callbackGasLimit,
    ],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};
// address vrfCoordinatorV2,
// uint64 subscriptionId,
// bytes32 gasLane, // keyHash
// uint256 interval,
// uint256 entranceFee,
// uint32 callbackGasLimit
module.exports.tags = [`all`, `raffle`];
