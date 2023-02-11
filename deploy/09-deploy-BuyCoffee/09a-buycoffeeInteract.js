const { deployments, getNamedAccounts, ethers } = require('hardhat');

//getting log globally
const { log } = deployments;

module.exports = async ({ getNamedAccounts }) => {
  //getting deployer account
  const { deployer } = await getNamedAccounts();
  const tipAmount = ethers.utils.parseEther('0.02');
  const tipperName = 'Sai Pramod';
  const tipperMessage = 'Hope you like the coffee from me';
  log('The deployer is', deployer);

  //getting the contract
  const BuyMeCoffeeContract = await ethers.getContract('BuyMeACoffee');

  //using getSigners we can get the all signer accounts we have, for default network hardhat these are accounts
  //run in hardhat node
  const allAccounts = await ethers.getSigners();

  //We can only use 3 accounts to test this
  const accounts = [allAccounts[0], allAccounts[1]];

  //We can now check the balances of these accounts and contract
  log('== Start ==');
  log('******* The initial balances of all accounts are.. *******');
  await printBalance(accounts);
  let contractBalance = await ethers.provider.getBalance(
    BuyMeCoffeeContract.address
  );
  log(
    'The initial balance of coffee contract is',
    ethers.utils.formatEther(contractBalance)
  );

  /********* Funding the contract *********/
  //We can connect second account to make the funding to smart contract
  const tippingTx = await BuyMeCoffeeContract.connect(allAccounts[1]).buyCofee(
    tipperName,
    tipperMessage,
    { value: tipAmount }
  );
  const tippingtxResponse = await tippingTx.wait(1);
  log('== Funded ==');
  log('******* The balances of all accounts are after funding.. *******');
  await printBalance(accounts);
  contractBalance = await ethers.provider.getBalance(
    BuyMeCoffeeContract.address
  );
  log(
    'The balance of coffee contract after funding is',
    ethers.utils.formatEther(contractBalance)
  );

  /********* Withdrawing the funds from contract to contract owner **********/
  // As the contract deployer is account[0], the funds will be transferred to deployer account
  const withdrawtx = await BuyMeCoffeeContract.withdraw();
  await withdrawtx.wait(1);
  log('== Withdrawn ==');
  log('******* The final balances of all accounts after withdraw.. *******');
  await printBalance(accounts);
  contractBalance = await ethers.provider.getBalance(
    BuyMeCoffeeContract.address
  );
  log(
    'The final balance of coffee contract after withdraw..',
    ethers.utils.formatEther(contractBalance)
  );

  /******** Getting the memos **********/
  const memos = await BuyMeCoffeeContract.getMemos();
  await printMemos(memos);
};

// returns Ethers balance of given address
const getAddressBalances = async (address) => {
  const balance = await address.getBalance();
  return ethers.utils.formatEther(balance);
};

//Logs ethers balance of a list of addresses
// addresses will be array of addresses
const printBalance = async (addresses) => {
  let idx = 0;
  for (const eachAddress of addresses) {
    log(`Address ${idx} balance: ${await getAddressBalances(eachAddress)}`);
    idx++;
  }
};

//Print the memos stored on-chain from the coffee purchases
//memos will be array of objects
const printMemos = async (memos) => {
  for (const eachMemo of memos) {
    const timeStamp = await eachMemo.timestamp;
    const funder_name = eachMemo.name;
    const funder_address = eachMemo.from;
    const message = eachMemo.message;
    log(
      `At ${timeStamp} , ${funder_name} with address ${funder_address} sent the message ${message}`
    );
  }
};

module.exports.tags = ['allcoffee', 'coffeeInteract'];

/* Output - goerli

== Start ==
******* The initial balances of all accounts are.. *******
Address 0 balance: 0.378205492287224735
Address 1 balance: 0.130143845134328933
The initial balance of coffee contract is 0.0
== Funded ==
******* The balances of all accounts are after funding.. *******
Address 0 balance: 0.378205492287224735
Address 1 balance: 0.110143845131421879
The balance of coffee contract after funding is 0.02
== Withdrawn ==
******* The final balances of all accounts after withdraw.. *******
Address 0 balance: 0.398205492286771391
Address 1 balance: 0.110143845131421879
The final balance of coffee contract after withdraw.. 0.0
At 1675007676 , Sai Pramod with address 0x7c97f0f5B128869854B3F72fcD8BABE3EA9BcC13 sent the message Hope you like the coffee from me


*/
