//Here we can write one verification scriupt for all the contracts

const { network, run } = require('hardhat');
require('dotenv').config();

const verfiifcation = async (contractAddreess, constructorArgs) => {
  console.log('*******Verification Run***********');
  const chainID = network.config.chainId;
  //The etherscan api is only for ethereum chain - it will not work for bnb or polygon
  if (chainID == 5 && process.env.Etherscan_API_Key) {
    console.log('Verifying contract...');
    try {
      await run('verify:verify', {
        address: contractAddreess,
        constructorArguments: constructorArgs,
      });
      console.log('The contract is verified ............');
    } catch (error) {
      if (error.message.includes('Already verfied')) {
        console.log('The contract is already verified');
      } else {
        console.log('The error is', error);
      }
    }
  }
  if (chainID !== 31337 && chainID !== 5) {
    console.log(
      'You are on network where auto verification is not possible currently.....'
    );
  }
  if (chainID == 31337) {
    console.log(`The contract need not be verified - You're on local chain`);
  }
};

module.exports = { verfiifcation };
