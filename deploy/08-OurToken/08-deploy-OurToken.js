// Here we can deploy the ERC20 token

//Imports
const { deployments, getNamedAccounts, network } = require('hardhat');
const { networkconfig } = require('../../utilities/raffle-helper');
const { verfiifcation } = require('../../utilities/verfification');

module.exports = async ({ deployments, getNamedAccounts }) => {
  //Getting deploy and log
  const { deploy, log } = deployments;
  //Getting deployer
  const { deployer } = await getNamedAccounts();

  //checking the network we are on
  const chainID = network.config.chainId;
  log(`We are on ${network.name} network and chain id is ${chainID}`);

  //Setting the arguments to contract constructor
  const initialSupply = 100;
  _args = [initialSupply];

  //deploy script
  const OurTokenContract = await deploy('OurToken', {
    from: deployer,
    args: _args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(
    '***** The contract is deployed at address',
    OurTokenContract.address,
    '******'
  );

  //Running the verification, verfiifcation = async (contractAddreess, constructorArgs)
  await verfiifcation(OurTokenContract.address, _args);
};

module.exports.tags = ['ourToken', 'all_ourToken'];
