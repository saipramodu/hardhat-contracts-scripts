//Imports
const { deployments, getNamedAccounts, network } = require('hardhat');

//Deployement

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  log('using log');

  const { deployer } = await getNamedAccounts();

  //checking the network
  log('We are on', network.name, 'and chainID is', network.config.chainId);

  /******Deploying the contract *********/

  //syntax is const any_variable_name = await deploy(contract_name, {list of overrides})
  const teslaHorsePower = await deploy('TeslaPower', {
    from: deployer,
    arguments: [],
    log: true,
    waitconfirmations: network.config.blockConfirmations || 1,
  });

  log(
    `***** The Contract is deployed with address ${teslaHorsePower.address} **********`
  );
};

module.exports.tags = ['tesla'];

/*Output

using log
We are on hardhat and chainID is 31337
deploying "TeslaPower" (tx: 0xb8b9eedd43e7b993602544137645883868305c2eaac96737917c1f47a828787b)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 138025 gas
***** The Contract is deployed with address 0x5FbDB2315678afecb367f032d93F642f64180aa3 **********
*/
