/* Manualy written 

use yarn init to initalise a project in this Hardhat_modules folder

(remmeber that yarn equivalent of npx is yarn itself
    ie. yarrn = npm and yarn = npx
    
the yarn equivalent of npm install is just yarn)

next run yarn add --dev hardhat, we are installing developer packages

(remember that we should have installed git, node etc. to run this)

then run yarn hardhat for creating a project

once the project is setup, hitting yarn hardhat again will give you the list of commands

*/

/*

Yarn - Functionalities

yarn hardhat node  - gives all the fake accounts in hardhat for development

yarn hardhat compile - will give the artifacts folder files

We have now installed globally hardhat-shorthand, so instead of yarn hardhat, we can use hh ie. hh compile will work

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

9. Remember that any function that uses gas (not a view or pure function), wait for 1 block ie. we need not wait 
for functions that are view or pure. 

10. Values returned from a transaction are not available outside of EVM. We need events and emits to use these return valuses
*/

/* Review 2 - deploying contracts using hardhat deploy, 

1. we can use a package called hardhat-deploy to deploy the contracts without using scripts
   see https://github.com/wighawag/hardhat-deploy/tree/master for this

2. We need to install hardhat-deploy-ethers which add extra features to access deployments 
   as ethers contract

3. If you see the package json, we can see that hardhat-deploy-ethers will override the hardhat-ethers

4. We need to create deploy folder to put the deploy scripts

5. Add require('hardhat-deploy') in hardhat config file
*/

/* Testing

1. Unit testing - testing individual units of source code
these can be done in local hardhat or in forked hardhat 

2. Staging test / Integration test - these tests to be done in the testnet (Last step before mainnet deploying)
Our goal is not only to see if the code runs correctly but also to make it as gas efficient as possible
using gas reporter

*/

/* Lottery Raffle contract

1. Abstract contracts are the ones with atleast one function but not implemented. These type of contracts are intended
to be used by other contracts by inheriting.
ie. abstract contract abstractcontract{function()},  contract derivedcontract is abstractcontract
The contract that inherits the interface must override and implement all the functions of the interface. 
If any of the function is not overridden, you need to mark the inheriting contract as abstract.

2. We need to pass the constructors in abstract contract in the derived contract

3. Generating random number is the key here which cannot be done within the smart contract. We need to depend
on oracle networks for this random number.

4. We are using Get a Random Number from https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number

5. Virtual functions in abstract contracts are something that are meant to be overridden. 
All functions are virtual by default in interface contract.

6. If we inherit any contract, we need to put that contract's constructor. 

7. Interfaces are the contracts that help us to intercat with othet contracts. Interfaces will only have 
function definition but not the logic. Using the actual contract address we can interact with it using interafce
https://stackoverflow.com/questions/71072475/does-a-contract-instance-created-via-interfaces-have-the-same-address-as-the-ori
https://medium.com/coinmonks/solidity-tutorial-all-about-interfaces-f547d2869499

8. To automate triggering smart contracts, chainlink keepers are used. https://docs.chain.link/chainlink-automation/introduction/

9. Upkeeps: These are the jobs or tasks that you execute on-chain. For example, 
you can call a smart contract function if a specific set of conditions are met.

10. VRFCoordinatorV2.sol is the top level large contract. As it is a very large contract, we can create interfaces to interact
with small portions of the larger contract. The interface will have functions declared without any functionality written. 
To interact with larger contract we need to use interface_contract_name contract_variable =  interface_contract_name(larger_contract_address)

11. For local chain, we need a mock contract address of this large contract. Chainlink already has this mock contract 
which we can deploy and use its address

12. We are getting keyhash gas lanes from supported networks in chainlink

*/

/** NFTs and ERC 721
 1. Refer to https://nftschool.dev/reference/metadata-schemas/#intro-to-json-schemas for basics
 * CID - content identifiers - is a label used to point to material in IPFS. It doesn't indicate where the content is stored, but it forms a kind 
   of address based on the content itself. CIDs are short, regardless of the size of their underlying content.
 
2. Look into EIP 721 https://eips.ethereum.org/EIPS/eip-721 

3. The NFT minting contract can contain the token URIs pointing to a metadata JSON schema. This metadata can be located on chain
   or off chain in IPFS. SVG - Scalar Vector Graphics

4. The URIs of NFT location is hashed when stored off chain, this URI is called base URI. In on chain the JSON  
   object can be encoded in base 64. We can use base64-sol to encode the metadata to base64 - 
   use yarn add --dev base64-sol to add this package

5.  ipfs://QmRrkC8TqK8mfymFA3cvj8DZ9TNfvdPsNuCWvKaf4ajyW9/4442.json is the token uri if the NFT is stored off chain. 
   Here  ipfs://QmRrkC8TqK8mfymFA3cvj8DZ9TNfvdPsNuCWvKaf4ajyW9 is base URI which will be same for all NFTs stored in that location
   then /4442 is the token id

6. For onchain the token uri will be like data:application/json;base64/here the base64 encodement of metadata/
 */

/* ERC 20 Tokens */
