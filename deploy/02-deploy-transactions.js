// To deploy any contract - steps are to use deployments, named accounts

const { getNamedAccounts, deployments, network } = require('hardhat');

// We can use module.exports = async ()=>{}

module.exports = async ({ deployments, getNamedAccounts }) => {
  // Why we use deployments and getNamedAccounts
  const { deploy, log } = deployments;
  //any time a function run - use await so tat it needs to get completed before moving to next
  const { deployer } = await getNamedAccounts();

  const chainID = network.config.chainId;
  log(
    `We are currently in ${network.name} network and the chainID is ${chainID}`
  );

  //That's it - now we can deploy the contract
  log('Deploying the contract......');

  //   syntax is const any_variable_name = await deploy(contract_name, {list of overrides object})

  const transactionsContract = await deploy('Transactions', {
    from: deployer,
    arguments: [''],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(
    `The contract is deployed....the contract address is ${transactionsContract.address}`
  );
  log('The deployer address is', deployer);
};

module.exports.tags = ['transactions'];

/* Output (localhost) 

Nothing to compile
We are currently in localhost network and the chainID is 31337
Deploying the contract......
deploying "Transactions" (tx: 0x6abb8304aa1364d2096a991abaed92ce2d19560c1654644e79b8e03534f8e465)...: deployed at 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0 with 937197 gas
The contract is deployed....the contract address is 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
The deployer address is 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

*/
