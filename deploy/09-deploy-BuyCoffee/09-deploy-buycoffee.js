//Imports
const { deployments, getNamedAccounts, network } = require('hardhat');
const { verfiifcation } = require('../../utilities/verfification');

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  log('Using log in buy coffee');

  //Getting deployer
  const { deployer } = await getNamedAccounts();

  //checking the network and chain ID
  const chainID = network.config.chainId;
  log(
    `We are currrently in ${network.name} network and chain id is ${chainID}`
  );

  //deploy script
  const BuyMeCoffeeContract = await deploy('BuyMeACoffee', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(
    `********* The contract is deployed with address ${BuyMeCoffeeContract.address} *********`
  );

  //Verification of the contract
  // verfiifcation = async (contractAddreess, constructorArgs)
  await verfiifcation(BuyMeCoffeeContract.address, []);
};

module.exports.tags = ['coffee', 'allcoffee'];

/*** Output - goerli
 
Using log in buy coffee
We are currrently in goerli network and chain id is 5
reusing "BuyMeACoffee" at 0x95d17644f504ca0C5234BB84f0bf9c0808d1C45C
********* The contract is deployed with address 0x95d17644f504ca0C5234BB84f0bf9c0808d1C45C *********
*******Verification Run***********
Verifying contract...
Nothing to compile
Successfully submitted source code for contract
contracts/BuyMeaCoffee.sol:BuyMeACoffee at 0x95d17644f504ca0C5234BB84f0bf9c0808d1C45C
for verification on the block explorer. Waiting for verification result...

Successfully verified contract BuyMeACoffee on Etherscan.
https://goerli.etherscan.io/address/0x95d17644f504ca0C5234BB84f0bf9c0808d1C45C#code
The contract is verified ............

 */
