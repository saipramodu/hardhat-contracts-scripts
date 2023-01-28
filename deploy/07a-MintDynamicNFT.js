// Now we can interact with the contract using yarn hardhat deploy --tags

const { deployments, getNamedAccounts, ethers } = require('hardhat');

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { log } = deployments;
  log('using log...');
  /***** Getting the contract *********/
  const DynamicSvgNftContract = await ethers.getContract('DynamicSvgNft');
  // Testing the ETH price logic
  const ethPrice = (await DynamicSvgNftContract.getETHinUSD()).toString();
  const eth = ethers.utils.parseEther('1').toString();
  //   const ethPricetxResponse = await ethPricetx.wait(1);
  log('ETH Price in USD', ethPrice);
  log('ETH', eth);
  log('Minting NFT.........');
  const mintingtx = await DynamicSvgNftContract.mintNFT();
  const mintingtxResponse = mintingtx.wait(1);
  log('NFT minted based on the price of ETH.........');
};

module.exports.tags = ['mintDynamicNFT'];
// 119678233276
//ETH 1000000000000000000 - ethers. parse will give the eth in wei
//0x3f84a5fC79B2F3cd796Ff637D3297f0cc0d95055 - Training acc.
