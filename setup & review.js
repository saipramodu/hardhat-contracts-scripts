/* Manualy written 

use yarn init to initalise a project in this Hardhat_modules folder

(remmeber that yarn equivalent of npx is yarn itself
    ie. yarrn = npm and yarn = npx
    
the yarn equivalent of npm install is just yarn)

next run yarn add --dev hardhat, we are installinh developer packages

(remember that we should have installed git, node etc. to run this)

then run yarn hardhut for creating a project

once the project is setup, hitting yarn hardhat again will give you the list of commands

*/

/*

Yarn - Functionalities

yarn hardhat node  - gives all the fake accounts in hardhat for development

yarn hardhat compile - will give the artifats folder files

*/

/* Review 1 (till 10.00)

1. we deployed contract in hardhat and the test net 

3. we intercated with the contract using contract.functionName()

4. we used ethescan plugin to programatically run the verification of the contracts - used etherscan API key in config file to do this

5. we learnt to use make automated task block-number and imported in config file -
    task ('task name', 'what it does').setAction(async ()=>{*action function*}) and then require('./tasks/getBlockNo') in config file

6. we learnt to create tests for each function in the contract - syntax:
     describe('Contract name', ()=>{
    beforeEach (**deploy the contract**)
    it(**write testing scripts using asser or expect**)
    assert.equal() is good to use as it's easy to read

7. yarn hardhat coverage will give the coverage files which gives info on which functions still do not have tests written

8. we learnt to do gas reporter using built in hardhat gas reporter
    we made the config in a way that when we run test the gas report file will be geneerated

9. remember that any function that uses gas (not a view or pure function), wait for 1 block

*/

/* Review 2 - deploying contracts, 

1. we can use a package called hardhat-deploy to deploy the contracts without using scripts
   see https://github.com/wighawag/hardhat-deploy/tree/master for this

2. We need to install hardhat-deploy-ethers which add extra features to access deployments 
   as ethers contract

3. If you see the package json, we can see that hardhat-deploy-ethers will override the hardhat-ethers

4. We need to create deploy folder to put the deploy scripts
*/

/* Testing

1. Unit testing - testing individual units of source code
these can be done in local hardhat or in forked hardhat 

2. Staging test / Integration test - these tests to be done in the testnet (Last step before mainnet deploying)
Our goal is not only to see if the code runs correctly but also to make it as gas efficient as possible
using gas reporter

*/
