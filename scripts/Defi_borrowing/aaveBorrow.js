// In this application we can deposit our ETH / WETH as collateral to the AAVE protocol
// Next we can use the collateral and then borrow some DAI (stable coin pegged to USD)
// Then we can repay the DAI

const { ethers, getNamedAccounts } = require('hardhat');
const { getWeth, WETHcontractAddress, ETH_AMOUNT } = require('./getWeth');
// We are using abi directly as there is some issue when there are 2 AggregatorV3Interface in v0.6 and v0.8 of chainlink
const _abi = require('@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json');

// This is a script so we need the main function

const main = async () => {
  // It is important to know that the AAVE protocol always treats all as ERC20 tokens
  // The native token ETH is not a ERC-20 token
  // This is where WETH (Wrapped ETH) comes in - WETH is a ERC-20 peg of ETH, AAVE protocol
  // usually will swap the ETH to WETH
  await getWeth();

  //We can get the lending pool address
  const { deployer } = await getNamedAccounts();
  const lendingPoolContract = await getLendingPool(deployer);
  console.log('The lending pool address -- ', lendingPoolContract.address);

  // Next we need to build the logic to deposit our WETH tokens to the lendingPoolContract
  console.log('Depositing the WETH to Lending pool....');

  // The lendingPoolContract uses safeTransferFrom which will pull WETH tokens out from our account
  // inorder for this to happen, we need to first approve this transaction
  await approveERC20(
    lendingPoolContract.address,
    ETH_AMOUNT,
    deployer,
    WETHcontractAddress
  );

  // function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
  await lendingPoolContract.deposit(
    WETHcontractAddress,
    ETH_AMOUNT,
    deployer,
    0
  );
  console.log('Deposited....');
  const accBalance = ethers.utils.formatEther(
    await ethers.provider.getBalance(deployer)
  );
  console.log('The deployer remaining balance (ETH) -- ', accBalance);

  // After we deposited the WETH to the lending pool, we can now be able to borrow wrt the collateral we put in
  // But before borrowing, we need to check the detail like health factor, we cannot borrow above a limit
  const { totalDebtETH, availableBorrowsETH } = await getUserData(
    lendingPoolContract,
    deployer
  );
  // But here, we want to borrow DAI, so we need to match the availableBorrowsETH to DAI to check
  // how much we DAI we can borrow
  const DAI_Price = ethers.utils.formatEther(
    await getDAI_ETHPrice(_abi, deployer)
  );
  console.log('One DAI price in ETH -- ', DAI_Price);
  //Parsing ether will always convert it to WEI
  //all the contracts usually take in in WEI units and not in ETH, ie. we need to add 18 decimals always
  const maxDAIBorrowLimit = ethers.utils.parseEther(
    (availableBorrowsETH / DAI_Price).toString()
  );
  console.log(`You will be able to borrow ${maxDAIBorrowLimit} DAI`);
  const amountofDAIToBorrow = ethers.utils.parseEther('25');
  // We can borrow the DAI now
  await borrowDAI(
    maxDAIBorrowLimit,
    amountofDAIToBorrow,
    lendingPoolContract,
    deployer
  );
  //We can see our data again to check the amount deposited and borrowed
  await getUserData(lendingPoolContract, deployer);

  //We can now repay the DAI we borrowed
  const amountofDAIToRepay = ethers.utils.parseEther('28');
  await repayDAI(
    amountofDAIToRepay,
    lendingPoolContract,
    deployer,
    lendingPoolContract.address
  );
  await getUserData(lendingPoolContract, deployer);
};

// Once we have gotten the WETH, next step is to deposit our WETH
// for this AAVE uses a lending pool address to perform all actions like deposit, withdraw, borrow etc.
// AAVE recommends to fetch the lending pool contract address always from a lendingPoolProvider contract
// What they are doing is kepping the lendingPoolProvider as a constant contract to update the actual protocol as needed
// the lendingPoolProvider address will be immutable

const getLendingPool = async (account) => {
  //Let's get the lendingPoolProvider contract first

  //Lendingpoolprovider address from aave doc. (mainnet)
  const lendingPoolProviderAddress =
    '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5';

  // Notice that we are importing ILendingPoolAddressesProvider in ILendingPoolProvider
  // once we import and compile, the contract ABI will be available in our artifacts
  const lendingPoolAddressProvider = await ethers.getContractAt(
    'ILendingPoolAddressesProvider',
    lendingPoolProviderAddress,
    account
  );

  // Now we can use getAddress from lendingPoolProvider
  // function getLendingPool() external view returns (address);
  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();

  //Now we get the actual lendingPool using the lendingPoolAddress
  // when we use getContract at, we can get a contract at specified address
  const lendingPoolContract = await ethers.getContractAt(
    'ILendingPool',
    lendingPoolAddress,
    account
  );
  return lendingPoolContract;
};

//Logic to get users data like health factor
const getUserData = async (lendingPoolContract, account) => {
  // function getUserAccountData(address user) from lending pool contract
  let { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPoolContract.getUserAccountData(account);
  totalCollateralETH = ethers.utils.formatEther(totalCollateralETH);
  totalDebtETH = ethers.utils.formatEther(totalDebtETH);
  availableBorrowsETH = ethers.utils.formatEther(availableBorrowsETH);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed (debt)`);
  console.log(`You can still borrow ${availableBorrowsETH} worth of ETH`);
  return { totalDebtETH, availableBorrowsETH };
};

// Logic to get DAI/ETH price
const getDAI_ETHPrice = async (AggregatorV3Interface_abi, account) => {
  //Getting AggregatorV3Interface price feed contract
  const DAI_ETH_Address = '0x773616e4d11a78f511299002da57a0a94577f1f4';
  const priceFeedContract = await ethers.getContractAt(
    AggregatorV3Interface_abi,
    DAI_ETH_Address,
    account
  );
  //We can get the latest price from AggregatorV3 pricefeed contract
  const { answer } = await priceFeedContract.latestRoundData();
  return answer;
};

//Logic to borrow the DAI tokens
const borrowDAI = async (
  DAIBorrowLimit,
  amount,
  lendingPoolContract,
  account
) => {
  try {
    console.log('Borrowing....');
    const DAI_address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    // function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)
    const borrowingTx = await lendingPoolContract.borrow(
      DAI_address,
      amount,
      1,
      0,
      account
    );
    borrowingTx.wait(1);
    const DAIcontract = await ethers.getContractAt('IERC20', DAI_address);
    const DAIBalance = ethers.utils.formatEther(
      await DAIcontract.balanceOf(account)
    );
    console.log(
      'Great the borrowing is complete and balance of DAI in your account is',
      DAIBalance
    );
  } catch (error) {
    console.log(error);
  }
};

// Logic to repay
const repayDAI = async (
  amount,
  lendingPoolContract,
  account,
  spenderAddress
) => {
  try {
    //First whenever the contract can pull money from our account, it always needs to be approved by us
    const DAI_address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    await approveERC20(spenderAddress, amount, account, DAI_address);
    console.log('Repaying....');
    const repayDAI = await lendingPoolContract.repay(
      DAI_address,
      amount,
      1,
      account
    );
    await repayDAI.wait(1);
    console.log(`Great, you have now repayed ${amount} of DAI`);
  } catch (error) {
    console.log(error);
  }
};

//Logic to approve the transaction before lendingPoolContract can pull tokens from our account
const approveERC20 = async (spenderAddress, amount, account, tokenAddress) => {
  //get the WETH contract
  const iWETHContract = await ethers.getContractAt(
    'IWeth',
    tokenAddress,
    account
  );
  //Approve the transaction
  // function approve(address spender, uint256 value)
  // here the spender the contract to which we are giving approval to - here it is lendingPoolContract address
  const approveTx = await iWETHContract.approve(spenderAddress, amount);
  await approveTx.wait(1);
  console.log('Hey the transaction is approved......');
};

main()
  .then(() => {
    console.log('the code runs');
    //0 means end the process without any kind of failure and 1 means end the process with some failure.
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

/* OutPut  - using mainnet forked in hardhat local - ie. just running without any network

Using getWeth()
The Balance of WETH in account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 -- 0.02
The lending pool address --  0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
Depositing the WETH to Lending pool....
Hey the transaction is approved......
Deposited....
The deployer remaining balance (ETH) --  9999.969609255796495594
You have 0.02 worth of ETH deposited
You have 0.0 worth of ETH borrowed (debt)
You can still borrow 0.0165 worth of ETH
One DAI price in ETH --  0.000609983884282095
You will be able to borrow 27049894964715758000 DAI
Borrowing....
Great the borrowing is complete and balance of DAI in your account is 25.147851621172240086
You have 0.020000000196807528 worth of ETH deposited
You have 0.015249597107052375 worth of ETH borrowed (debt)
You can still borrow 0.001250403055313836 worth of ETH
Hey the transaction is approved......
Repaying....
Great, you have now repayed 25000000000000000000 of DAI
You have 0.020000000350830811 worth of ETH deposited
You have 0.000000000997536065 worth of ETH borrowed (debt)
You can still borrow 0.016499999291899354 worth of ETH
the code runs

*/
