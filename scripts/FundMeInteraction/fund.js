// We can now try to interact with the Fundme contract

const { ethers, getNamedAccounts, deployments } = require('hardhat');

//structure is async main (){}

async function main() {
  // To interact with the contract we need to get contract and need deployer
  try {
    const { deployer } = await getNamedAccounts();
    const fundMeContract = await ethers.getContract('FundMe', deployer);
    const sendValue = ethers.utils.parseEther('2');
    //Now we can fund the contract
    console.log('Funding the contract......');
    const fundingResponse = await fundMeContract.fund({ value: sendValue });
    await fundingResponse.wait(1);
    console.log('The contract is funded');
  } catch (error) {
    console.log('Error is', error);
    process.exit(1);
  }
}

main();

/* Used yarn hardhat run file path --network localhost 

The local host will work only if you have started yarn hardhat node in one terminal
use another terminal to run file path --network localhost
*/
