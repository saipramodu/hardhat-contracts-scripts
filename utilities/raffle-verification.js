const { network, run } = require('hardhat');
const { developmentChains } = require('./raffle-helper');
const { deployments } = require('hardhat');
require('dotenv').config();

const Raffleverification = async (contractAddress, args) => {
  const { log } = deployments;

  if (developmentChains.includes(network.name)) {
    log(
      `Contract Verification: The contract cannot be verified, you're on local chain`
    );
  } else {
    if (network.name == 'goerli' && process.env.Etherscan_API_Key) {
      log('The network is goerli network, verifying contract......');
      try {
        await run('verify: verify', {
          address: contractAddress,
          constructorArguments: args,
        });
        log('The contract is verified......');
        // await run('verify:verify', {
        //   address: contractAddreess,
        //   constructorArguments: constructorArgs,
        // });
      } catch (error) {
        if (error.message.includes('Already Verified')) {
          log('The contract is alredy verified...');
        } else {
          log(`Error is ${error}`);
        }
      }
    } else {
      log(
        `You're on a chain where auto verification is not currently possible....`
      );
    }
  }
};

module.exports = { Raffleverification };
