//Imports
const { deployments, getNamedAccounts, network, ethers } = require('hardhat');

module.exports = async ({ deployments, getNamedAccounts }) => {
  //log, deploy
  const { deploy, log } = deployments;

  //named accounts
  const { deployer } = await getNamedAccounts();

  //network and chainID
  const chainID = network.config.chainId;
  log(`We are on ${network.name} network and chain ID is ${chainID}`);

  //deploying script
  log('Contract being deployed....');
  const BasicNFTContract = await deploy('BasicNFT', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(`The contract is deployed with address ${BasicNFTContract.address}`);

  // We can write also here the logic to mint the NFT
  const NFTContract = await ethers.getContractAt(
    'BasicNFT',
    BasicNFTContract.address
  );
  log('Mintng Doggie NFT...');
  const mintTx = await NFTContract.mintNFT();
  mintTx.wait(1);
  log('Minted the dog, great !!!!!!');
};

module.exports.tags = ['fcc_basicNFT'];

/* Output - Goerli 

We are on goerli network and chain ID is 5
Contract being deployed....
reusing "BasicNFT" at 0xca8ad3f351b89cbccbc434a2f5e267df2db74280
The contract is deployed with address 0xca8ad3f351b89cbccbc434a2f5e267df2db74280
Mintng Doggie NFT...
Minted the dog, great !!!!!!

*/
