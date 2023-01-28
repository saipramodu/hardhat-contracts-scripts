//Imports
const { deployments, getNamedAccounts, network, ethers } = require('hardhat');
const {
  networkconfig,
  developmentChains,
} = require('../utilities/raffle-helper');
const { verfiifcation } = require('../utilities/verfification');

module.exports = async ({ deployments, getNamedAccounts }) => {
  // Getting deploy and log from deployments
  const { deploy, log } = deployments;
  // log('using Log');

  //Getting Deployer
  const { deployer } = await getNamedAccounts();

  //Checking the network we are on
  const chainId = network.config.chainId;
  log(`The current network is ${network.name} and the Chain ID is ${chainId}`);

  //All argument variables to pass to constructor
  let _vrfCoordinator;
  // Entrance Fee is the min eth to enter the Raffle, we can configure based on chains - for costly chains we can have higher
  // to compensate for higher gas fee
  const entranceFee = networkconfig[chainId].entranceFee;
  // The maximum gas price you are willing to pay for a request in wei. Define this limit by specifying the appropriate
  // keyHash in your request. The limits of each gas lane are important for handling gas price spikes when
  // Chainlink VRF bumps the gas price to fulfill your request quickly.
  const keyhash = networkconfig[chainId].keyhash;
  // Next we require subscription ID, for onchains we can use chainlink UI to get the subID
  //After deploying, remember to add the contract address as the consumer in the subscription
  // for mocks we need to generate subID from createSubscription() function in the mock contract
  let subId;
  const callbackGasLimit = networkconfig[chainId].callbackGasLimit;
  // Setting interval between each raffles as 30s
  const interval = '30';

  /*****Deploying the contract **********/

  //syntax is const any_variable_name = await deploy(contract_name, {list of overrides})
  log('Deploying the contract....');

  //   log(`The VRF address is ${networkconfig[chainId].VRF_address}`);

  // If the mock address is not showing in hardhat network, use localhost to deploy mocks and run this, it'll work
  if (developmentChains.includes(network.name)) {
    const VRFCoordinatorV2MockContract = await ethers.getContract(
      'VRFCoordinatorV2Mock'
    );
    _vrfCoordinator = VRFCoordinatorV2MockContract.address;
    //We are now calling the function in mock contract
    const createSubscriptionResponse =
      await VRFCoordinatorV2MockContract.createSubscription(); //createSubscription emits an event
    const transactionReceipt = await createSubscriptionResponse.wait();
    subId = transactionReceipt.events[0].args.subId;
    // log('Transaction Response', createSubscriptionResponse);
    // log('Transaction recieipt', transactionReceipt);
    // log('SubID', subId);
    // Just checking below a view function where value is returned - we do not need events for view functions
    // const getFallbackResponse =
    //   await VRFCoordinatorV2MockContract.getFallbackWeiPerUnitLink();
    // // const getFallbackReceipt = await getFallbackResponse.wait();
    // log('getFallbackResponse', getFallbackResponse);
  } else {
    _vrfCoordinator = networkconfig[chainId].VRF_address;
    subId = networkconfig[chainId].subId;
  }

  const _args = [
    _vrfCoordinator,
    entranceFee,
    keyhash,
    subId,
    callbackGasLimit,
    interval,
  ];

  log('The constructor arguments are', _args);
  const raffleContract = await deploy('Raffle', {
    from: deployer,
    args: _args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(
    '***** The contract is deployed with address',
    raffleContract.address,
    '*********'
  );

  //Here we can automate the verification process to verify raffle contract - the mocks should not be verified as
  //they are only deployed in local chain
  await verfiifcation(raffleContract.address, _args);
};

module.exports.tags = ['raffle', 'allRaffle'];

// 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

/* Output (goerli):
On chain network detected! mock contract need not be deployed here
The current network is goerli and the Chain ID is 5
Deploying the contract....
The constructor arguments are [
  '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
  BigNumber { _hex: '0x2386f26fc10000', _isBigNumber: true },
  '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
  '8002',
  '500000',
  '30'
]
reusing "Raffle" at 0x12bF23DcbB14cE63f45cb710e4c3B61f2F854639
***** The contract is deployed with address 0x12bF23DcbB14cE63f45cb710e4c3B61f2F854639 *********
*******Verification Run***********
Verifying contract...
Nothing to compile
Successfully submitted source code for contract
contracts/Raffle.sol:Raffle at 0x12bF23DcbB14cE63f45cb710e4c3B61f2F854639
for verification on the block explorer. Waiting for verification result...

Successfully verified contract Raffle on Etherscan.
https://goerli.etherscan.io/address/0x12bF23DcbB14cE63f45cb710e4c3B61f2F854639#code
The contract is verified ............
*/
