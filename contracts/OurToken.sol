// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// We can use @openzeppelin/contracts to create ERC20 tokens, use yarn add --dev @openzeppelin/contracts
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

//Inherit ERC20.sol into this contract
contract OurToken is ERC20 {
  /****** Construtor *******/
  //In constructor we need to set the constructor variables of inherited contract
  // constructor(string memory name_, string memory symbol_)

  constructor(uint256 initialSupply) ERC20('OurToken', 'OUT') {
    // Just passing the argments to ERC20 only initializes the token but to create tokens we need to mint it
    // using _mint function from ERC20, the intial supply will be assigned to msg.sender
    _mint(msg.sender, initialSupply);

    // Remember that default decimals is 18, ie like wei - so initial supply should be 100 * 10e18 for 100 tokens
  }

  // All other functionslities are already inherited from ERC20 contract like transfer, allowance etc.abi
  // allowance is the amount of tokens which you can give access to someone else to transfer
}
