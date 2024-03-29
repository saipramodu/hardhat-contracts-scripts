const { version } = require('chai');

require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('./tasks/getBlockNo');
require('hardhat-deploy');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-etherscan');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: '0.8.17' },
      { version: '0.6.8' },
      { version: '0.4.19' },
      { version: '0.6.12' },
    ],
  },

  //sepcifying default network for reference - if not specified, hardhat will take hardhat network
  defaultNetwork: 'hardhat',
  // to add new networks we always need RPC url and the acc. private key
  //we can create these in .env file and then call here
  //remember to add the dotenv package in dev dependencies
  //see the way to add network and private key here
  // The chain IDs can be got from chainlist.org
  /* Local blockchian: The default hardhat is not actually same as ganache - the default always resets back

  we can actually run a local blockchain that we can keep track of using yarn hardhat node
  and add local network rpc
  
  */
  networks: {
    hardhat: {
      chainId: 31337,
      // see that we are going to fork the mainnet which will simulate having the same state as mainnet
      // but will work in our local environment
      // This will by default always fork the mainnet - we can comment it when we can use mocks instead of forking
      // forking: {
      //   url: process.env.MAINNET_RPC_URL,
      //   // if you put block number - it is called pinning the blocknumber - hardhat suggests that this will run quicker
      //   // by pinning archival data is used - we can uncomment the block number for something like getting latest pricefeeds
      //   // blockNumber: 14390000,
      // },
    },
    localhost: {
      //spinned up from yarn hardhat node
      url: 'http://127.0.0.1:8545/',
      //accounts are taken default from hardhat
      chainId: 31337,
    },
    goerli: {
      url: process.env.Goreli_RPC_URL,
      accounts: [process.env.PRIVATE_KEY_OTHER, process.env.PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
    polygon: {
      url: process.env.Polygon_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
      blockConfirmations: 6,
    },
    bnb: {
      url: process.env.bnb_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 97,
      blockConfirmations: 6,
    },
  },

  //Etherscan is need to do verifications of the contracts using etherscan plugins
  etherscan: {
    apiKey: process.env.Etherscan_API_Key,
  },

  //There is hardhat gas reporter installed along with hardhat to report the gas
  //Running the tests will automatically give the gas report
  //see https://www.npmjs.com/package/hardhat-gas-reporter
  gasReporter: {
    //We can keep the gas reporter not enabled and only enable when required
    enabled: false,
    //Output file will spit out a file rather than displaying in terminal
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'INR',
    //We need to put the API key to use the market prices
    //Enable api key when need to see price in usd or Inr - comment below line when not required
    coinmarketcap: process.env.COINMARKETCAP_API,
    //as default the token is set to eth - to run to different networks, we can add other tokens
    //adding avalanche token here as an example
    // token: 'AVAX',
  },
  namedAccounts: {
    //Deployer will be accounted to acc. 0
    deployer: {
      default: 0,
    },
    //Deployer will be accounted to acc. 1
    player: {
      default: 1,
    },
  },
};
