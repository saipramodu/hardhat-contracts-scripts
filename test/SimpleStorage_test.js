//We need to test our contracts before we actually deploy
//A way to test it is using yarn hardhat test **test File name**
// and writing scripts for testing here

const { assert } = require('chai');
const { ethers } = require('hardhat');

//Syntax to write testing scripts is
/*
 describe('Contract name', ()=>{

    beforeEach (**deploy the contract**)
    it(**write testing scripts using asser or expect**)

    assert.equal() is good to use as it's easy to read
})

*/

describe('SimpleStorage', async () => {
  let contractFactory, contract;
  //beforeEach will run before the it functions
  beforeEach(async () => {
    contractFactory = await ethers.getContractFactory('SimpleStorage');
    contract = await contractFactory.deploy();
    await contract.deployed();
  });

  //1. Checking the initial value
  it('The contract should have default value as 0', async () => {
    const currentValue = await contract.retrieve();
    const defaultValue = '0';
    //using assert to test the default value
    assert.equal(currentValue.toString(), defaultValue);
  });

  //2. Now checking for the stored value
  it('Testing if the contract stores the correct value given', async () => {
    const storeNumber = '7';
    const transactionResponse = await contract.store(storeNumber);
    await transactionResponse.wait(1);
    const numberStored = await contract.retrieve();
    assert.equal(numberStored.toString(), storeNumber);
  });
});
