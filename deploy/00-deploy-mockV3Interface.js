// In this file we will try to deploy the mock V3 contract we made
// this is to deploy our fundme contract in the local chain
// we want to get the address of this mock V3 contract so we can use it for local chain

//as always to deploy 1. imports 2. the deploy script is an export. The hardhat config has an import of hardhat - deploy
//module.exports = async(deployments, getNamedAccounts) ={}

const { deployments, getNamedAccounts, network, ethers } = require('hardhat');

module.exports = async ({ deployments, getNamedAccounts }) => {
  //   const deployments = hre.deployments;
  //   const { deploy, log } = deployments;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // log is console.log

  // We can create a logic so that we will deploy this mock only on to local chain and
  //restrict deploying to other chains

  const network_name = network.name;
  const chainID = network.config.chainId;
  log(
    `The current network you're in is ${network_name} and chain ID is ${chainID}`
  );
  // the arguments for mockV3 contract
  const Decimals = 18;
  const InitialAnswer = ethers.utils.parseEther('2000'); //Inital answer is USD eth price with 18 decimal places
  log(InitialAnswer);

  if (chainID === 31337) {
    //Here we can deploy the contract
    // log('Network is Local');
    log('Deploying Mocks to local chain');
    const mockv3AgrregatorContract = await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      //arguments are the parameters called in the constructor function of mockV3 contract
      args: [Decimals, InitialAnswer],
    });
    log(
      `Mocks deployed.....The contract address is ${mockv3AgrregatorContract.address}`
    );
  } else {
    log('You are trying to deploy a mock contract to blockchain!!!');
    log('Cannot be deployed ..........');
  }
};

//Unlike yarn hardhat run **file path** - in yarn hardhat deploy we cannot put the path
//It will always run the js files from deploy folder
//we can create tags to deploy specific js files, like using yarn hardhat deploy --tags mocks to run this file

module.exports.tags = ['mocks', 'allfund', 'allDynamicNFT'];

/* Output:
Run on local network, the tx and gas details are due to log:true in deploy

Nothing to compile
The current network you're in is hardhat and chain ID is 31337
2000000000000
Deploying Mocks to local chain
deploying "MockV3Aggregator" (tx: 0xd308a7035e31cf243b75485a82a0d447b227d866e91d5683476bd47d7ee86965)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 569647 gas
Mocks deployed.....The contract address is 0x5FbDB2315678afecb367f032d93F642f64180aa3
*/
