const { deployments, getNamedAccounts, network, ethers } = require('hardhat');
const { developmentChains } = require('../utilities/raffle-helper');

// This is VRF Coordinator mock - can be used for any random number request

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const baseFee = ethers.utils.parseEther('0.25');
  const gasPriceLink = 1e9;
  //Now we need to check if we are on local chain or not, the mock contract need to be deployed only on local chain
  if (developmentChains.includes(network.name)) {
    log(
      'We are on the development chain',
      network.name,
      'deploying mock contract.....'
    );
    //Deploying mock contract
    const arguments = [
      // Base fee is the oracle gas in LINK token to get a random number from oracle function
      baseFee,
      // Gas price Link is a calculated value
      // Chainlink nodes are the ones that are paying the gas fee in chain to execute upkeep automatically
      // This value is in real chains (non local) fluctuates to match the LINK token to actual gas on chain
      // Imagine if eth price skyrockets, the oracle gas in LINK should be higher - LINK per on chain gas fee
      // For mocks this can be 1e9 (this is in gwei I beleive)
      gasPriceLink,
    ];
    const mockVRF = await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      args: arguments,
      log: true,
    });
    log('............Mocks Deployed!.............');
  } else {
    log('On chain network detected! mock contract need not be deployed here');
  }
};

module.exports.tags = ['allRaffle', 'mockRaffle', 'allNftIpfs'];
