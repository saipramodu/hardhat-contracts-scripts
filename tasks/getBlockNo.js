const { task } = require('hardhat/config');

task('block-number', 'prints the current block number we are on').setAction(
  async (taskargs, hre) => {
    console.log('Waiting to get the current block number....');
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log('The current block number of the chain is', blockNumber);
  }
);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {};

// The task syntax is ktask ('task name', 'what it does').setAction(async ()=>{*action function*})
//now you can type yarn hardhat block-number for the current block - it will be 0 for default hardhat network
//type yarn hardhat block-number --network goerli to get the current block of testnet
