const { deployments, getNamedAccounts, ethers, network } = require('hardhat');

module.exports = async ({ deployments, getNamedAccounts }) => {
  //Getting log
  const { log } = deployments;

  //Getting deployer, this deployer is actually from local node with 100 ether balance
  const { deployer } = await getNamedAccounts();
  log('Deployer is', deployer);

  //Using getsigners we can get the accounts
  const accounts = await ethers.getSigners();
  log('The account is', accounts[0].address);

  //The balances we get are always in wei
  const balance = await accounts[0].getBalance();
  log('The starting balance is', balance.toString());

  //When you parse ether - it is always in BigNumber, we can convert it to string()
  log('1 ether', ethers.utils.parseEther('1').toString());

  //Getting the contract
  const RaffleContract = await ethers.getContract('Raffle');
  // log('Raffle contract', RaffleContract);

  // To enter the raffle, we have to pay the minimum entrance fee we hardcoded
  // getting the minimum entrance fee
  const minEntranceFee = await RaffleContract.getEntrancFee();
  log('The minimum entrance fee is (in ETH)', minEntranceFee.toString() / 1e18);

  //Entering the raffle
  // const enterRaffletx = await RaffleContract.enterRaffle({
  //   value: minEntranceFee,
  // });
  // const enterRaffletxResponse = await enterRaffletx.wait(1);
  // log(
  //   'The balance after entering raffle is',
  //   (await accounts[0].getBalance()).toString()
  // );
  // log('The player is', await RaffleContract.getPlayer(0));
  // log('The winner is', await RaffleContract.getRecentWinner());

  //Getting the current block
  const lastTimeStamp = await RaffleContract.getLastTimeStamp();
  log('Last Time Stamp', lastTimeStamp.toString());
};

module.exports.tags = ['enterRaffle'];

/* Goerli accs 
0x7c97f0f5B128869854B3F72fcD8BABE3EA9BcC13
0x3f84a5fC79B2F3cd796Ff637D3297f0cc0d95055 - balance: 0.5099 GoerliETH

*/

/* OutPut in Goerli - checking balances
Deployer is 0x3f84a5fC79B2F3cd796Ff637D3297f0cc0d95055
The account is 0x3f84a5fC79B2F3cd796Ff637D3297f0cc0d95055
The balance is 509906657888812777
*/
