// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Transactions {
  uint256 public transactionCount;

  // Creating an event - Events are only used in Web3 to output some return values.
  // They are a way to show the changes made into a contract. they are only visible outside the contract.
  // When you call an event in Solidity, the arguments passed to it are stored in the transaction’s
  // log - a special data structure in the Ethereum blockchain. These logs are associated with the
  // address of the contract, incorporated into the blockchain, and stay there as long as a block is accessible

  event Transfer(
    address from,
    address receiver,
    uint256 amount,
    string message,
    uint256 timestamp,
    string keyword
  );

  //   Creating a struct item

  struct transferStruct {
    address sender;
    address receiver;
    uint256 amount;
    string message;
    uint256 timestamp;
    string keyword;
  }

  // transferstruct[] will create the array of objects
  transferStruct[] public transactions;

  function addToBlockchain(
    address receiver,
    uint256 amount,
    string memory message,
    string memory keyword
  ) public payable {
    transactionCount += 1;

    // To push to struct the method is struct_variable.push = (struct name(obj1, obj2...))
    transactions.push(
      transferStruct(
        msg.sender,
        receiver,
        amount,
        message,
        block.timestamp,
        keyword
      )
    );

    //We need to emit the event
    emit Transfer(
      msg.sender,
      receiver,
      amount,
      message,
      block.timestamp,
      keyword
    );
  }

  // Function to view all the transactions - returns (return type)
  function getAllTransaction() public view returns (transferStruct[] memory) {
    //Get transacions
    return transactions;
  }

  //Function to view transaction count
  function getTransactionCount() public view returns (uint256) {
    return transactionCount;
  }
}
