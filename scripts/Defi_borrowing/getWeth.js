const { getNamedAccounts, ethers } = require('hardhat');

//Here we can deposit our ETH to get back WETH

// since we are forking the mainnet- we will be able to use the WETH contract deployed in the mainnet
// This contract address is from WETH token address in mainnet
const WETHcontractAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const ETH_AMOUNT = ethers.utils.parseEther('0.02');

const getWeth = async () => {
  // We can use IWETH intreface to interact and convert our ETH to WETH

  const { deployer } = await getNamedAccounts();
  console.log('Using getWeth()');

  //We need to call 'deposit' function from WETH contract, we can see the WETH contract in
  // https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2#code
  // to interact with the contract we need the abi and contract address
  //We are going to use contract address from mainnet (refer above link)

  // Notice that we are using getContractAt - we need abi/contract name, address, signer
  const iWeth = await ethers.getContractAt(
    'IWeth',
    WETHcontractAddress,
    deployer
  );

  //After getting the contract, we can now interact with it
  const depositTx = await iWeth.deposit({ value: ETH_AMOUNT });
  depositTx.wait(1);

  //Now we can check the balance of Weth we have
  // function balanceOf(address owner) external view returns (uint256 balance);
  const wethBalance = ethers.utils.formatEther(await iWeth.balanceOf(deployer));
  console.log(`The Balance of WETH in account ${deployer} -- ${wethBalance}`);
};

module.exports = { getWeth, WETHcontractAddress, ETH_AMOUNT };
