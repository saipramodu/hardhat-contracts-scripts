const { deployments, getNamedAccounts, network, ethers } = require('hardhat');
const {
  networkconfig,
  developmentChains,
} = require('../utilities/nfts-helper');

//Here we are deploying the RandomIpfsNft contract

module.exports = async ({ deployments, getNamedAccounts }) => {
  //Getting deploy and log
  const { deploy, log } = deployments;
  //Getting deployer, always use await or else JS executes asynchronously
  const { deployer } = await getNamedAccounts();

  //Checking the network we are on
  const chainId = network.config.chainId;
  log(`We are currently in ${network.name} and chain Id is ${chainId}`);

  //Setting the variables
  let _vrfCoordinator;
  const keyHash = networkconfig[chainId].keyhash;
  let subId;
  const callbackGasLimit = networkconfig[chainId].callbackGasLimit;
  const fundAmount = ethers.utils.parseEther('1');
  let dogTokenUris = [
    'ipfs://QmUVPL885Di7RDbnWkFm2sLjgSua4imDDiJZQrpKk4z2Bj',
    'ipfs://Qmf7jQMfDQr9Hsa6T7sjAEXFaaTg5FiE5VoQceFeRBKndX',
    'ipfs://QmYY7cKG1exY3BrbRGJyUYXfSPSaucyxX1JpMQAgTvB51G',
  ];

  /********* Deploying the contract ************/

  if (developmentChains.includes(network.name)) {
    //if we are on local chain, we need a mock vrf - I've used previously deployed mock for raffle
    const VRFCoordinatorV2MockContract = await ethers.getContract(
      'VRFCoordinatorV2Mock'
    );
    _vrfCoordinator = VRFCoordinatorV2MockContract.address;
    // We need to create a subscription in our local chain to get the subId
    const txResponse = await VRFCoordinatorV2MockContract.createSubscription();
    //Create Subscription will emit a subId
    const txReceipt = await txResponse.wait(1);
    subId = txReceipt.events[0].args.subId;
    //After subscribing it is important that we fund the subscription contract
    // function fundSubscription(uint64 _subId, uint96 _amount) public
    await VRFCoordinatorV2MockContract.fundSubscription(subId, fundAmount);
    log('VRF Mock address is....', _vrfCoordinator);
  } else {
    _vrfCoordinator = networkconfig[chainId].VRF_address;
    //The real subID can be made from vrf.chain.link
    subId = networkconfig[chainId].subId;
  }

  //Below are the constructor arguments
  //   constructor(
  //     address _vrfCoordinator,
  //     bytes32 keyHash,
  //     uint64 subId,
  //     uint32 callbackGasLimit,
  //     string[3] memory dogTokenUris
  const _args = [
    _vrfCoordinator,
    keyHash,
    subId,
    callbackGasLimit,
    dogTokenUris,
  ];
  // log('Args', _args);
  log('Deploying the random NFT IPFS contract......');
  const RandomIpfsNftContract = await deploy('RandomIpfsNft', {
    from: deployer,
    args: _args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(
    `******* The contract is deployed with address ${RandomIpfsNftContract.address} *******`
  );
};

module.exports.tags = ['allNftIpfs', 'NftIpfs'];

/*** OutPut: Goerli 
 
On chain network detected! mock contract need not be deployed here
We are currently in goerli and chain Id is 5
Deploying the random NFT IPFS contract......
deploying "RandomIpfsNft" (tx: 0x79031da2d8f0826152ae865579a1551eedcfc71090a14359a4b82545e1ec5fef)...: deployed at 0xf9CA76Ac574E1d8CCe1a53c6fe89234f5d447EfD with 3259391 gas
******* The contract is deployed with address 0xf9CA76Ac574E1d8CCe1a53c6fe89234f5d447EfD *******
*/
