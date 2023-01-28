//Imports
const { deployments, getNamedAccounts, network } = require('hardhat');

//Deploy script
module.exports = async ({ deployments, getNamedAccounts }) => {
  //First get deploy and log
  const { deploy, log } = deployments;

  //Now get the deployer
  const { deployer } = await getNamedAccounts();

  //Check the netwrok we are on
  const chainId = network.config.chainId;
  log(`The current network is ${network.name} and the chain ID is ${chainId}`);

  //Now we can deploy the contract
  // log('Deploying the contract..........');
  // const stakingContract = await deploy('Staking', {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   waitConfirmations: network.config.blockConfirmations || 1,
  // });

  // log('The contract is deployed with address', stakingContract.address);
};

//Tags
module.exports.tags = ['staking', 'allstake'];
