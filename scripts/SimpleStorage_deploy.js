//All the scripts to deploy the contracts can be made in scripts folder

/*
The structure of deploying scripts is same as the ethers js deployment

1. Imports 

2. Async main function 

3. calling main function with promise returns

4. Verifying the deployed contract

** To compile the contract run yarn hardhat compile in your terminal. 
   The compile task is one of the built-in tasks.

*/

//1. Imports

const { ethers, network } = require('hardhat');
const { etherscan } = require('../hardhat.config');
//notice we are importing from hardhat and not from 'ethers'

let test = 5;

//2. Async main function

async function main() {
  //as default the contract is deployed into hardhat local network,
  // this is very much like ganache but built into the hardhat itself
  // it will automatically take the rpc url and acc. private key to deploy - so no need to specify the provider or wallet
  //Once the contract is compiled, all the build info like abi or binary, hardhat is smart to get it from correct folders
  //so no need to specify the abi or binary

  //We can directly create contractfoctory

  const contractFactory = await ethers.getContractFactory('SimpleStorage');
  console.log('Deploy loading.....');

  //we can now deply the contract to local hardhat network

  const contract = await contractFactory.deploy();
  //I believe deployed() is for transaction receipt
  await contract.deployed();

  console.log(`The address of contract is: ${contract.address}`);
  //You can see the network details using network after importing network and see etherscan api key from config file
  console.log('the network is', network.name);
  console.log('The eth api key is', etherscan.apiKey);
  // console.log('The deployed contract is', contract);

  //We can now verify our contract after deploying using verify function in 4.
  //But we can only verify functions deployed to testnet, we can logic this using network chainID
  if (network.config.chainId === 5 && etherscan.apiKey) {
    //we need to wait for few blocks to be mined before running verification process
    console.log(
      'We are waiting for few blocks to be mined before verification...'
    );
    await contract.deployTransaction.wait(6);
    //passing empty array for contructor args
    await verifyContract(contract.address, []);
  }

  //Interacting with the contract
  await contractInteraction(contract);
}

//2A. We can now interact with the functions inside the contract

async function contractInteraction(contract) {
  const currentFavNo = await contract.retrieve();
  console.log('The current Fav no. is', currentFavNo);

  //Storing 80 as Fav no. any time we transact something with gas, it is important to wait for one block
  const storeTransaction = await contract.store(80);
  await storeTransaction.wait(1);
  const newfavNo = await contract.retrieve();
  console.log('The new fav no. is', newfavNo);
}

//3. Calling the main function

main()
  .then(() => {
    console.log('The code runs');
    process.exit(0);
    // Parameter:  This function accepts single parameter described below:
    //Code: It can be either 0 or 1.
    //0 means end the process without any kind of failure and 1 means end the process with some failure.
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

//use yarn hardhat run scripts/*filename*  to run the deploy script

//Inorder to deploy the contracts to a testnet - we need to add the network in hardhat config file
//once the network is added we can run yarn hardhat run scripts/*filename --network <network-name>

//4. We can now write a sript to verify the contract we deployed

//if we do not know any function type yarn hardhat verify --help
// we can programitcally run the verification for our contract
// to verify you'll need the contract function and the constructor arguments (this is an array not needed in this contract)

async function verifyContract(contractAddreess, constructorArgs) {
  // for this function to run, we should add the etherscan api key in hardhat config file
  // we need to put 'verify:verify like below
  console.log('Verifying contract...');

  //We can try and catch the verfiifcation as few times the contract might have been already verified
  try {
    await run('verify:verify', {
      address: contractAddreess,
      constructorArguments: constructorArgs,
    });
  } catch (error) {
    console.log(`The error is ${error}`);
  }
}

/* 
Deploy loading.....
The address of contract is: 0x988dDdd8cC957882B8f91865571b4A5aAe4317Ee
the network is goerli
The eth api key is RV3X6AEQ115YHI6X37RARKE5SJUZM8QPUN
We are waiting for few blocks to be mined before verification...
Verifying contract...
Nothing to compile
Successfully submitted source code for contract
contracts/Storage.sol:SimpleStorage at 0x988dDdd8cC957882B8f91865571b4A5aAe4317Ee
for verification on the block explorer. Waiting for verification result...

Successfully verified contract SimpleStorage on Etherscan.
https://goerli.etherscan.io/address/0x988dDdd8cC957882B8f91865571b4A5aAe4317Ee#code
The current Fav no. is BigNumber { _hex: '0x00', _isBigNumber: true }

** stopped as last line was getting long
*/
