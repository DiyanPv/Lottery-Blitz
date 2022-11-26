/** @type import('hardhat/config').HardhatUserConfig */
require(`dotenv`).config();
require(`hardhat-contract-sizer`);
require(`solidity-coverage`);
require(`hardhat-gas-reporter`);
require(`@nomiclabs/hardhat-waffle`);
require(`hardhat-deploy`);
require(`@nomiclabs/hardhat-etherscan`);
module.exports = {
  solidity: "0.8.17",
};
