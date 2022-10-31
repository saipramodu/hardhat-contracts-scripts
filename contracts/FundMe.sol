// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConvertor.sol";
import "hardhat/console.sol";



//The error function below is the way to create custom errors
//refer https://medium.com/coinmonks/solidity-revert-with-custom-error-explained-with-example-d9dff8937ef4
//Best practice is to use the contract name before the error function
error FundMe__NotOwner();

/// @title A simulator for trees (This is the way to create tags) which can be used to make documentation
// refer to Natspec style guide in https://docs.soliditylang.org/en/latest/natspec-format.html#natspec

contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    //We can make the priceFeedContract a global variable
    // to call any contract =>  actual_contract_name contract_varible = actual_contract_name (contract address)
    AggregatorV3Interface public priceFeedContract;
    
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        //instead of hardcoding the AggregatorV3Interface address for each chain, we can script it
        // to call any contract =>  actual_contract_name contract_varible = actual_contract_name (contract address)
        priceFeedContract = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(msg.value.getConversionRate(priceFeedContract) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }
    
    function getVersion() public view returns (uint256){
        // ETH/USD price feed address of Goerli Network.
        // 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e below is only for ETH goerli testnet
        return priceFeedContract.version();
    }
    
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        //We can also import console.log in Solidity to see the values in out terminal
        // This will console log when you run the tests for withdraw function
        console.log("This is console log test from solidity...");
        funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
    // Sai - In the above withdraw unction we are looping over the variables stored in storage array
    // This is going to cost a lo of gas - instead we can shift all the variables to memory and then loop
    // if we check the gas reporter the chaeper withdraw will have consumed lesser gas

    function cheaperWithdraw() public onlyOwner{
        //remember that mappings cannot be in memory
        address[] memory cheap_funders= funders;

        for (uint256 funderIndex=0; funderIndex < cheap_funders.length; funderIndex++){
             address funder = cheap_funders[funderIndex];
             addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require (callSuccess, "Call failed");

    }



    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly


