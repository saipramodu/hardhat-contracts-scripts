//hardhat-deploy allows you to write deploy scripts in the deploy folder.
// execute the following task: yarn hardhat deploy --tags *tags from module.exports.tags*--network <networkName>

/* Traditionally we used 1. imports 2. main function 3. calling main() 
   to deploy the contracts using scripts

   In deploy we have to just make the imports and create a export function

   Remmeber that we need to import the hardhat deploy on to the hardhat config
 */

//* Below is one way to create and export the module

// function deployFunction() {
//   console.log('Hello deploy');
// }
// module.exports.default = deployFunction;

//we can use module.exports = async ()=>{}

const { deployments, getNamedAccounts, network } = require('hardhat');
const { networkConfig } = require('../PriceFeed_helper');
const { verfiifcation } = require('../utilities/verfification');
// import { networkConfig } from '../PriceFeed_helper';

module.exports = async ({ deployments, getNamedAccounts }) => {
  //   console.log('Hello deploy function');
  //   console.log(hre); //we can see the entire hre - hardhat runtime environment

  //from deployments we want to get deploy and log
  const { deploy, log } = deployments;

  //getNamedAccounts is a function - we can get the deployer details (this is coded in hardhat config file)
  const { deployer } = await getNamedAccounts();
  const chainID = network.config.chainId;
  //The network will change as per --network u specify
  console.log(
    `The name of the network is ${network.name} and chainID is ${chainID}`
  );

  //The FundMe contract is going to get prices from PriceConvertor contract as per the contract address we pass now
  //ie. the FundMe contract has a constructor with argument - we need to pass the argument when we deploy the contract
  // we can make a script so that the address is taken as per the chain we are on
  // we'll import PriceFeed_helper file to configure the network address
  //(but remember to put this outside deploy folder)
  //if the object inside networkConfig is a number - networkConfig[number] is the way to call
  //this is same as for string - networkConfig.'string' as below for example
  // console.log(networkConfig.test);

  console.log(
    'The price feed address is',
    networkConfig[chainID].priceFeedAddress
  );
  //Asssigning to a variable
  const ethUSDPriceFeedAddress = networkConfig[chainID].priceFeedAddress;
  //Now we can deploy the contract
  //syntax is const any_variable_name = await deploy(contract_name, {list of overrides})

  log('Deploying the contract....');
  const fundMeContract = await deploy('FundMe', {
    from: deployer,
    args: [ethUSDPriceFeedAddress],
    log: true,
    // In next step is where we wait for few blocks. We can wait for 6 block comfirmations or 1
    //here network.config.blockConfirmations(6 blocks) is from hardhat config file
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(
    `The contract is deployed.......The contract address is ${fundMeContract.address}`
  );
  //Deployer is the address of the deeployer
  log('Deployer is', deployer);

  //Now we can write a cript to auto verify the contracts
  //Instead of writing a code in ach deployment - we can have one verification function in utilities folder
  // Note that this auto verfification will not work in chains other than goerli
  // because we have put etherscan api key and plugin - we have not put api key for other chains
  await verfiifcation(fundMeContract.address, [ethUSDPriceFeedAddress]);
};

module.exports.tags = ['fundme', 'allfund'];
// After deploying the contracts - we can interact with the contract - refer to fund and withdraw interaction in scripts

/* Ran with yarn hardhat deploy --network bnb, for bnb blockchain 
/* Once 

Output: 

Nothing to compile
The name of the network is bnb and chainID is 97
The price feed address is 0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7
deploying "FundMe" (tx: 0x7668ea0278d471996cf3f0f4bfde68bb45486870eb8ba4927affa39f72d8d076)...: deployed at 0x46097E9b459fdbDcD3589E81fd0Cd1c79D5f478f with 856751 gas

//10.31
*/

// The price feed address is 0x5FbDB2315678afecb367f032d93F642f64180aa3
// The contract address is   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

/* Output in Polygon

The name of the network is polygon and chainID is 80001
The price feed address is 0x0715A7794a1dc8e42615F059dD6e406A6594651A
Deploying the contract....
deploying "FundMe" (tx: 0xd6aed235b1febc0174a84c04fa483dc958de15916f2b2a7ae0fc99977c701cda)...: deployed at 0x8d5710d75DCDaFDdA265C6f92e1635878b23EfB3 with 859351 gas
The contract is deployed.......The contract address is 0x8d5710d75DCDaFDdA265C6f92e1635878b23EfB3

*/

/*  Output with goerli and auto verification

The name of the network is goerli and chainID is 5
The price feed address is 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
Deploying the contract....
deploying "FundMe" (tx: 0x2fd5c156687490de9b3d78eb85f9ad1873450fd12a862df8e6e4d029d6d45a19)...: deployed at 0xaA3Ab48dc0EC76ecF046137bd909EB04312b4ce2 with 859351 gas
The contract is deployed.......The contract address is 0xaA3Ab48dc0EC76ecF046137bd909EB04312b4ce2
*******Verification Run***********
Verifying contract...
Nothing to compile
Successfully submitted source code for contract
contracts/FundMe.sol:FundMe at 0xaA3Ab48dc0EC76ecF046137bd909EB04312b4ce2
for verification on the block explorer. Waiting for verification result...

Successfully verified contract FundMe on Etherscan.
https://goerli.etherscan.io/address/0xaA3Ab48dc0EC76ecF046137bd909EB04312b4ce2#code
The contract is verified ............
*/
