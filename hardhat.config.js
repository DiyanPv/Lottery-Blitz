/** @type import('hardhat/config').HardhatUserConfig */
require(`dotenv`).config();
require(`hardhat-contract-sizer`);
require(`solidity-coverage`);
require(`hardhat-gas-reporter`);
require(`@nomiclabs/hardhat-waffle`);
require(`hardhat-deploy`);
require(`@nomiclabs/hardhat-etherscan`);
const RINKEBY_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
module.exports = {
  defaultNetwork: `hardhat`,
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    goerli: {
      chainId: 5,
      blockConfirmations: 6,
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: "0.8.17",

  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
};
