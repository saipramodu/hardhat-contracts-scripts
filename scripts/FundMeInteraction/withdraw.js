// We can now try to withdraw from the Fundme contract

const { ethers, getNamedAccounts, deployments } = require('hardhat');

//structure is async main (){}

async function main() {
  // To interact with the contract we need to get contract and need deployer
  try {
    const { deployer } = await getNamedAccounts();
    const fundMeContract = await ethers.getContract('FundMe', deployer);
    const sendValue = ethers.utils.parseEther('1');
    //Now we can fund the contract
    console.log('Withdrawing from the contract......');
    const withdrawResponse = await fundMeContract.cheaperWithdraw();
    await withdrawResponse.wait(1);
    console.log('Funds withdrawn');
  } catch (error) {
    console.log('Error is', error);
    process.exit(1);
  }
}

main();
