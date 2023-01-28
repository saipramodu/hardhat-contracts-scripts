// const { deployments, getNamedAccounts, ethers } = require('hardhat');

// module.exports = async ({ deployments, getNamedAccounts }) => {
//   const { log } = deployments;
//   log('using log');
//   const { deployer } = await getNamedAccounts();
//   const RandomIpfsNftContract = await ethers.getContract('RandomIpfsNft');
//   const requestDoggietx = await RandomIpfsNftContract.requestDoggie();
//   const requestDoggietxReceipt = await requestDoggietx.wait(1);
// };

// module.exports.tags = ['mintNFT'];

// /** Notes
//  * use yarn hardhat deploy --tags mintNFT to mint the NFT
//  * this will only work in on chain as the oracle will spin up a random number on chain
//  * as we request doggie, what we are doing is calling the oracle function to get us the random number and
//  * automatically run the fullfill random words function
//  * once the fullfill random words function is completed - the fullfillment will show as completed in vrf.chain.link
//  * an internal tx would have happened in the contract if u see etherscan
//  * We can use yarn hardhat console --network goerli to see the uri of the dog
//  * Here we can use tokenURI(uint256 tokenId) from ERC721URIStorage to get the token uri
//  */
