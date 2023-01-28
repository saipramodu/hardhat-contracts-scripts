const { deployments, getNamedAccounts, network, ethers } = require('hardhat');
const {
  network_config,
  developmentChains,
} = require('../utilities/dynamicNFT-helper');
const fs = require('fs');

const { verfiifcation } = require('../utilities/verfification');

module.exports = async ({ deployments, getNamedAccounts }) => {
  //Getting deploy and log
  const { deploy, log } = deployments;
  log('using the log');

  //Getting the deployer
  const { deployer } = await getNamedAccounts();

  //Getting chain ID
  const chainId = network.config.chainId;
  log(`We are in ${network.name} network and the chain ID is ${chainId}`);

  /***** Setting the Variables ********/
  const priceFeedAddress = network_config[chainId]._priceFeedAddress;
  const highValue = ethers.utils.parseEther('2000');
  // We can use the Node.js fs.readFileSync() Method to read the svg files
  const lowSvg = fs.readFileSync('./images/frown.svg', {
    encoding: 'utf-8',
  });
  const highsvg = fs.readFileSync('./images/happy.svg', { encoding: 'utf-8' });

  /******* Arguments *********/
  // constructor(string memory lowSvg, string memory highsvg, address priceFeedAddress, int256 highValue)
  _args = [lowSvg, highsvg, priceFeedAddress, highValue];

  /******** Deploying the contract *********/
  const DynamicSvgNftContract = await deploy('DynamicSvgNft', {
    from: deployer,
    args: _args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(
    `************ The contract is deployed at ${DynamicSvgNftContract.address} *************`
  );

  /****** Contract Verfification *********/
  //Reusing raffle verification we creayed earlier
  // await Raffleverification(DynamicSvgNftContract.address, _args);
  await verfiifcation(DynamicSvgNftContract.address, _args);
};

module.exports.tags = ['DynamicNFT', 'allDynamicNFT'];

/* Output in Goerli netwrok 

using the log
We are in goerli network and the chain ID is 5
deploying "DynamicSvgNft" (tx: 0x35241d041b9061ecc172f9b41e3964cb4bf099e625ab441298a6e9892cbdfb87)...: deployed at 0xAF4C9a23e5049a262c13d680C994427a16E2FCc9 with 4212529 gas
************ The contract is deployed at 0xAF4C9a23e5049a262c13d680C994427a16E2FCc9 *************

*/
