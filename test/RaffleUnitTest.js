// In this file we can run the unit tests for raffle contract
//Syntax to write unit tests
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

The logic is the beforeEach will run before every it function 

use yarn hardhat test file path --grep **it test name** to test individual its
*/

const { assert } = require('chai');
const { network, deployments, ethers } = require('hardhat');
const { developmentChains } = require('../utilities/raffle-helper');

//We should run these tests in local chain before performing staging tests in test nets
!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Contract unit tests', async () => {
      //1. Before each for using the deployed contracts
      beforeEach(async () => {
        const { log } = deployments;
        await deployments.fixture(['allRaffle']);
        // const Raffle_test = await ethers.getContract('Raffle');
        // const mockVRF_test = await ethers.getContract('VRFCoordinatorV2Mock');
        console.log('Hi');
      });
      describe('Constructor', async () => {
        it('SetsConstructor correctly', async () => {
          assert.equal(1, 1);
        });
      });
    });
