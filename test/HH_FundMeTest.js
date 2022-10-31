//Syntax to write testing scripts is
/*
 describe('Contract name', ()=>{

    beforeEach (**deploy the contract**)
    it(**write testing scripts using assert or expect**)

    assert.equal() is good to use as it's easy to read
})
*/

const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert } = require('chai');
const { ethers, deployments, getNamedAccounts } = require('hardhat');
const { networkConfig } = require('../PriceFeed_helper');

describe('FundMe Contract', async () => {
  const deployFixture = async () => {
    const contractFactory = await ethers.getContractFactory('FundMe');
    const { deployer } = await getNamedAccounts();
    const fundMeContract_test = await contractFactory.deploy(
      networkConfig[31337].priceFeedAddress
    );
    await fundMeContract_test.deployed();
    // console.log(fundMeContract_test);
    return fundMeContract_test, deployer;
  };

  //Testing the constructor functtion
  describe('Constructor', () => {
    it('sets the aggregator address correctly', async () => {
      const { fundMeContract_test, deployer } = await loadFixture(
        deployFixture
      );
      const response = await fundMeContract_test.priceFeedContract();
      assert.equal(response, networkConfig[31337].priceFeedAddress);
    });
  });
});
