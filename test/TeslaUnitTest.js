//Syntax to write unit tests

const { assert } = require('chai');
const { network, deployments, ethers } = require('hardhat');
const { developmentChains } = require('../utilities/raffle-helper');

/* 
describe('Contract name', async ()=>{
    beforeEach(()=>{
        deploy the contract here before running any tests
    })
    describe('Test name', async ()=>{
        it('What this test does', async ()=>{
            **Write the tests**
        })
    })
})
use yarn hardhat test file path --grep **it test name** to test individual its

The logic is the beforeEach will run before every it function 
*/
!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Tesla Power', async () => {
      let teslaTestContract;
      const set_horsepower = '509';
      // 1. Before each
      beforeEach(async () => {
        console.log('Hi using log');
        const fix = await deployments.fixture(['tesla']);
        teslaTestContract = await ethers.getContract('TeslaPower');
        // console.log('Fix', fix.address);
        // console.log('Test', teslaTestContract.address);
      });
      describe('Testing horsepower function', async () => {
        it('The function should change the horse power we input', async () => {
          const transactionResponse = await teslaTestContract.setHorsePower(
            set_horsepower
          );
          const transactionReceipt = await transactionResponse.wait();
          const horsepower = transactionReceipt.events[0].args.newValue;
          assert.equal(horsepower, set_horsepower);
        });
        it('We get the same horse power retreived', async () => {
          //In this it, the function setHorsePower() will not be considered - as this is a unit test
          const transactionResponse = await teslaTestContract.setHorsePower(
            set_horsepower
          );
          const transactionReceipt = await transactionResponse.wait();
          const horsepower = transactionReceipt.events[0].args.newValue;
          const retreivedHorsePower =
            await teslaTestContract.retreiveHorsePower();
          assert.equal(retreivedHorsePower.toString(), set_horsepower);
        });
      });
    });
