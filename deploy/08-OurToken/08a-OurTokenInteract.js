const { deployments, getNamedAccounts, ethers } = require('hardhat');

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { log } = deployments;
  log('Using Log');

  //Getting deployer
  const { deployer } = await getNamedAccounts();

  //First let's get the contract we deployed
  const OurTokenContract = await ethers.getContract('OurToken');
  log('The contract address', OurTokenContract.address);

  //Now we can interact with the contract using any of its functions
  const token_name = await OurTokenContract.name();
  const token_symbol = await OurTokenContract.symbol();
  log(`The token name: ${token_name} and symbol: ${token_symbol}`);

  // Seeing the balance
  const acc_balance = await OurTokenContract.balanceOf(deployer);
  log(`Balance with Deployer ${acc_balance}`);
};

module.exports.tags = ['all_ourToken'];
