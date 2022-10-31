// Staging tests are the ones run on testnet as the final step before deploying to the mainnet

// Here we can run only the basic test basic tests - to fund and withdraw the funds

//Imports

const { assert } = require('chai');
const { ethers, deployments, getNamedAccounts, network } = require('hardhat');

const chainID = network.config.chainId;
//We can make this test run only when we are not in hardhat network
// we are using if logic  ? yes : no
//here chain id is not in hardhat network ? run test : descipbe.skip (**skip the tests**)

chainID !== 31337
  ? describe('The FundMe contract test in Testnet', async () => {
      //Setting variables for test
      let fundMeContract_testnet;
      let deployerAcc;
      // As of 31st Oct => 50 usd is approx 0.032 ETH - we can put 0.035 ETH
      const sendValue = ethers.utils.parseEther('0.2');

      //The structure is get contarct before each tests - run it test

      beforeEach(async () => {
        //Here we do not need to eploy the contract as it is already deployed to the testnet
        // so await deployments.fixture(['allfund']); is not required
        // Also the V3 intreface is already in testnet

        //Getting deployer account
        const { deployer } = await getNamedAccounts();
        deployerAcc = deployer;

        fundMeContract_testnet = await ethers.getContract(
          'FundMe',
          deployerAcc
        );
        console.log('The deployer account is', deployerAcc);
        console.log('The chain ID is ', chainID);
      });

      //Run a basic test to see if we can fund and woithdraw the fund

      it('Test to see if we can fund the contract and then withdraw from it', async () => {
        const transactionResponse = await fundMeContract_testnet.fund({
          value: sendValue,
        });
        await transactionResponse.wait(1);
        //To get balance - ethers.provider.getBalance(address)
        const startingContractBalance = await ethers.provider.getBalance(
          fundMeContract_testnet.address
        );
        const startingDeployerBalance = await ethers.provider.getBalance(
          deployerAcc
        );
        const withdrawResponse = await fundMeContract_testnet.cheaperWithdraw();
        const withdrawReceipt = await withdrawResponse.wait(1);
        const { effectiveGasPrice, gasUsed } = withdrawReceipt;
        const gasCost = effectiveGasPrice.mul(gasUsed);
        const finalContractBalance = await ethers.provider.getBalance(
          fundMeContract_testnet.address
        );
        const finalDeployerBalance = await ethers.provider.getBalance(
          deployerAcc
        );

        assert.equal(finalContractBalance.toString(), '0');
        assert.equal(
          startingContractBalance.add(startingDeployerBalance).toString(),
          finalDeployerBalance.add(gasCost).toString()
        );
      });
    })
  : describe.skip;

/* Output: 

We first deployed the fundMe contract using yarn hardhat deploy --tags fundme --network goerli 
I used training acc (2nd acc to deploy the contract) - did take some time

Output of dployment: 
Nothing to compile
The name of the network is goerli and chainID is 5
The price feed address is 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
Deploying the contract....
deploying "FundMe" (tx: 0xbcc82000514e4429fdd7e13f35a1aa0b4bf4d58cb335f9ce5594b98e4a55c13b)...: deployed at 0xCb1574b49e711A2acE39766517Df86b0740BF238 with 1150887 gas
The contract is deployed.......The contract address is 0xCb1574b49e711A2acE39766517Df86b0740BF238
Deployer is 0x3f84a5fC79B2F3cd796Ff637D3297f0cc0d95055
*******Verification Run***********
Verifying contract...
Nothing to compile
Successfully submitted source code for contract
contracts/FundMe.sol:FundMe at 0xCb1574b49e711A2acE39766517Df86b0740BF238
for verification on the block explorer. Waiting for verification result...

Successfully verified contract FundMe on Etherscan.
https://goerli.etherscan.io/address/0xCb1574b49e711A2acE39766517Df86b0740BF238#code
The contract is verified ............
The contract need not be verified - You're on local chain (**This one I fixed the else statement in verification function)


** After eploying we can run yarn hardhat test --network goerli, but due to less eth available in goerli - I tested in bnb chain

    ✔ Test to see if we can fund the contract and then withdraw from it (13153ms)

  even we parse eth - 0.2 bnb token got funded and then transferred back

*/

// 0x3f84a5fC79B2F3cd796Ff637D3297f0cc0d95055
// 0x3f84a5fC79B2F3cd796Ff637D3297f0cc0d95055
