const { developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
require("dotenv").config();
const BASE_FEE = ethers.utils.parseEther("0.25");
let GAS_PRICE_LINK = 1 * 1000000000;

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const {deployer} = await getNamedAccounts();
  const chainId = network.config.chainId;
  if (developmentChains.includes(network.name)) {
    console.log(`Local network detected, deploying mock....`);
    const contract = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });
    console.log(`Mocks deployed. Contract address: ${contract.address} `);
    console.log(`------------------------`);
  }
};

module.exports.tags = [`all`, `mocks`];
