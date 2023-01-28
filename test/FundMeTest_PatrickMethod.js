// In this file we will create scripts to run unit tests for Fund me contract
// We will use hardhat deploy to deploy the contracts instead of

//Syntax to write testing scripts is
/*
 describe('Contract name', ()=>{

    beforeEach (**deploy the contract**)
    it(**write testing scripts using assert or expect**)

    assert.equal() is good to use as it's easy to read
})
*/

const { assert, expect } = require('chai');
const { deployments, getNamedAccounts, ethers, network } = require('hardhat');

const chainID = network.config.chainId;
// This entire test will run only when we are on hardhat network

chainID == 31337
  ? describe('FundMe contract', async () => {
      let fundMeContract_test;
      let mockv3AgrregatorContract_test;
      let deployerAcc;
      let sendValue = ethers.utils.parseEther('1');

      beforeEach(async () => {
        //In testing we need not deploy contracts again using await deploy (contract name, {from:, args: , log: })

        const { deployer } = await getNamedAccounts();
        deployerAcc = deployer;

        // In tests we can use deployments.fixture([required contract tag]) to make the deployments
        // notice the tag allfund in both fundme contract and the mockV3 contract

        const fix = await deployments.fixture(['allfund']);
        //We can see the console the deploy scripts from deploy folder
        // console.log('fix', fix);
        console.log('Hi');
        // console.log('Deployer acc.', deployerAcc);
        //Once the contract is deployed we need to get them
        fundMeContract_test = await ethers.getContract('FundMe');
        mockv3AgrregatorContract_test = await ethers.getContract(
          'MockV3Aggregator'
        );
        // console.log(fundMeContract_test); //Entrire fund me contract
        // console.log(mockv3AgrregatorContract_test); // Entire mockV3Contract
        // let response = await fundMeContract_test.priceFeedContract();
        // console.log('response is', response);
      });
      //1. Writing test for the constructor
      describe('Constructor', async () => {
        it('Sets the Aggregator function correctly', async () => {
          //write testing script for constructor
          // In response we are trying to get the priceFeedcontract address we are passing to the contract
          // This is from line 27 from fundMe contract
          //  AggregatorV3Interface public priceFeedContract; Notice we put () after priceFeedContract in test below
          // To test if the priceFeedContract() gives address you can console log this in beforeEach

          let response = await fundMeContract_test.priceFeedContract();

          // We now have the priceFeedContract address that we pass to the FundMe contract
          // we can compare this mockV3 contract address
          assert.equal(response, mockv3AgrregatorContract_test.address);
        });
      });

      //2. Now we can write test for the fund function
      describe('Fund funcion tests', async () => {
        it('Test to see if function fails if Minimum usd sent is less than 50', async () => {
          // Now we have to test if something fails - we can use expect to do this
          // await fundMeContract_test.fund(); // This will revert the function but this what we want
          //refer https://ethereum-waffle.readthedocs.io/en/latest/matchers.html - below is waffle script of expect().to.be.reverted
          //to send the eth - we can use parse ether from ethers
          // ethers.utils.parseEther('1') is 1 ether
          // or you can use parseUnits("Value", 'ether ** or gwei ** or wei')
          //Any USD value below 50 will revert the fund function
          await expect(
            fundMeContract_test.fund({
              value: ethers.utils.parseEther('0.0006'),
            })
          ).to.be.revertedWith('You need to spend more ETH!');
        });

        // Now we can test for the addressToAmountFunded mapping varaible
        // We need to test if the value if addressToAmountFunded is equal to amount we send

        it('Fund function should assign funds we send correctly to the address', async () => {
          // first call the fund function
          await fundMeContract_test.fund({ value: sendValue }); // This is definitely more than 50 USD
          const funderValue = await fundMeContract_test.addressToAmountFunded(
            deployerAcc
          ); // This should map 1 eth to the deployer

          assert.equal(funderValue.toString(), sendValue);
        });

        // Now we can test if funders.push(msg.sender) works correctly
        // Notice that we should not use [] in its - use () instead
        it('Test if funders.push works correctly', async () => {
          await fundMeContract_test.fund({ value: sendValue });
          const funderZeroAcc = await fundMeContract_test.funders(0);
          assert.equal(funderZeroAcc, deployerAcc);
        });
      });

      describe('Test the withdraw function', async () => {
        //We can fund the contract before any fo the tests

        beforeEach(async () => {
          await fundMeContract_test.fund({ value: sendValue });
        });

        //1. Test if the withdraw function transfers the amoun back to the deployer
        it('Test if withdraw transfers all funds back to deploter', async () => {
          //now we call the withdraw function
          const initialContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const initialDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );
          const transactionResponse = await fundMeContract_test.withdraw();
          //Anytime we make a transaction with the contract - we can wait for 1 block
          const transactionReceipt = await transactionResponse.wait(1);
          //The transaction receipt has the details of gas used -
          // learn about the debug console to see where this is in transacttion receipt
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          //mul is the bignumber multiplication
          const gasCost = effectiveGasPrice.mul(gasUsed);

          const finalContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const finalDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );

          // assert.equal(initialContractBalance, 2);
          // Testing if final contract balanace is 0
          assert.equal(finalContractBalance, 0);
          // Testing if the initial contract balance + initial deployer balance = final deployer balance + all the gas costs involved
          assert.equal(
            initialContractBalance.add(initialDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          );
        });
        // Now we need to test for multiple account funders
        it('Test of withdraw function with multiple accounts', async () => {
          //First we need to connect different hardhat accounts
          const accounts = await ethers.getSigners();

          // We need to create a new contract connecting the other accounts as only the dployer is currently connected
          for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMeContract_test.connect(
              accounts[i]
            );
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          // const fundersAddress = await fundMeContract_test.funders(0);
          // console.log('Funders', fundersAddress);

          // The for loop will have funded the fundMe contract with multiple accounts
          //Now we will withdraw the funds - copying from previous it
          const initialContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const initialDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );
          const transactionResponse = await fundMeContract_test.withdraw();
          //Anytime we make a transaction with the contract - we can wait for 1 block
          const transactionReceipt = await transactionResponse.wait(1);
          //The transaction receipt has the details of gas used -
          // learn about the debug console to see where this is in transacttion receipt
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          //mul is the bignumber multiplication
          const gasCost = effectiveGasPrice.mul(gasUsed);
          const finalContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const finalDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );

          // 1. See if the final contratc balance is 0
          assert.equal(finalContractBalance, 0);
          // All the withdrawn balance goes to the deployer - so same code as before it
          assert.equal(
            initialContractBalance.add(initialDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          );

          //Now we can test if the addressToAmountFunded mapper is reset to 0
          // Note that accounts[0] is the deployer account
          for (i = 1; i <= 6; i++) {
            assert.equal(
              await fundMeContract_test.addressToAmountFunded(
                accounts[i].address
              ),
              0
            );
          }

          //Now we can test if funders array is reverted back to a new array with no contents
          // If the array does not have any contents the call will revert, so our test passes if the array reverts
          await expect(fundMeContract_test.funders(0)).to.be.reverted;
          // console.log('funders length', fundMeContract_test.funders());
          // assert.equal(fundMeContract_test.funders.length, 1);
        });
        //We need to test if the function withdraw will be reverted if account other than deployer tries to withdraw the funds
        it('Test the withdraw function to see if only owner can withdraw the funds', async () => {
          //We can just connect one account to the contract and try to call the withdraw from that account

          const accounts = await ethers.getSigners();
          const attackerAddress = await accounts[2]; // accounts[0] is the deployer
          //connecting attackerAddress to the contract - connected_contract = contract.connect(connection address)
          const attackerConnectedContract = await fundMeContract_test.connect(
            attackerAddress
          );
          //we can try to run withdraw from attackerConnectedContract
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });
      });

      // Using the withdraw test for cheaper contract

      describe('Test the cheaper withdraw function', async () => {
        //We can fund the contract before any fo the tests

        beforeEach(async () => {
          await fundMeContract_test.fund({ value: sendValue });
        });

        //1. Test if the withdraw function transfers the amoun back to the deployer
        it('Test if cheaper withdraw transfers all funds back to deployer', async () => {
          //now we call the withdraw function
          const initialContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const initialDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );
          const transactionResponse =
            await fundMeContract_test.cheaperWithdraw();
          //Anytime we make a transaction with the contract - we can wait for 1 block
          const transactionReceipt = await transactionResponse.wait(1);
          //The transaction receipt has the details of gas used -
          // learn about the debug console to see where this is in transacttion receipt
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          //mul is the bignumber multiplication
          const gasCost = effectiveGasPrice.mul(gasUsed);

          const finalContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const finalDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );

          // assert.equal(initialContractBalance, 2);
          // Testing if final contract balanace is 0
          assert.equal(finalContractBalance, 0);
          // Testing if the initial contract balance + initial deployer balance = final deployer balance + all the gas costs involved
          assert.equal(
            initialContractBalance.add(initialDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          );
        });
        // Now we need to test for multiple account funders
        it('Test of cheaper withdraw function with multiple accounts', async () => {
          //First we need to connect different hardhat accounts
          const accounts = await ethers.getSigners();

          // We need to create a new contract connecting the other accounts as only the dployer is currently connected
          for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMeContract_test.connect(
              accounts[i]
            );
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          // const fundersAddress = await fundMeContract_test.funders(0);
          // console.log('Funders', fundersAddress);

          // The for loop will have funded the fundMe contract with multiple accounts
          //Now we will withdraw the funds - copying from previous it
          const initialContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const initialDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );
          const transactionResponse =
            await fundMeContract_test.cheaperWithdraw();
          //Anytime we make a transaction with the contract - we can wait for 1 block
          const transactionReceipt = await transactionResponse.wait(1);
          //The transaction receipt has the details of gas used -
          // learn about the debug console to see where this is in transacttion receipt
          const { effectiveGasPrice, gasUsed } = transactionReceipt;
          //mul is the bignumber multiplication
          const gasCost = effectiveGasPrice.mul(gasUsed);
          const finalContractBalance = await ethers.provider.getBalance(
            fundMeContract_test.address
          );
          const finalDeployerBalance = await ethers.provider.getBalance(
            deployerAcc
          );

          // 1. See if the final contratc balance is 0
          assert.equal(finalContractBalance, 0);
          // All the withdrawn balance goes to the deployer - so same code as before it
          assert.equal(
            initialContractBalance.add(initialDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          );

          //Now we can test if the addressToAmountFunded mapper is reset to 0
          // Note that accounts[0] is the deployer account
          for (i = 1; i <= 6; i++) {
            assert.equal(
              await fundMeContract_test.addressToAmountFunded(
                accounts[i].address
              ),
              0
            );
          }

          //Now we can test if funders array is reverted back to a new array with no contents
          // If the array does not have any contents the call will revert, so our test passes if the array reverts
          await expect(fundMeContract_test.funders(0)).to.be.reverted;
          // console.log('funders length', fundMeContract_test.funders());
          // assert.equal(fundMeContract_test.funders.length, 1);
        });
        //We need to test if the function withdraw will be reverted if account other than deployer tries to withdraw the funds
        it('Test the cheaper withdraw function to see if only owner can withdraw the funds', async () => {
          //We can just connect one account to the contract and try to call the withdraw from that account

          const accounts = await ethers.getSigners();
          const attackerAddress = await accounts[2]; // accounts[0] is the deployer
          //connecting attackerAddress to the contract - connected_contract = contract.connect(connection address)
          const attackerConnectedContract = await fundMeContract_test.connect(
            attackerAddress
          );
          //we can try to run withdraw from attackerConnectedContract
          await expect(attackerConnectedContract.cheaperWithdraw()).to.be
            .reverted;
        });
      });
    })
  : describe.skip;

//deployer account - 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// use yarn hardhat test file path --grep **it test name** to test individual its
