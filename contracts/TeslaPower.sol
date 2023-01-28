// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TeslaPower {
  uint256 private s_horsePower;

  event HorsePowerChanged(uint256 indexed newValue);

  function setHorsePower(uint256 newHorsePower) public {
    s_horsePower = newHorsePower;
    emit HorsePowerChanged(s_horsePower);
  }

  function retreiveHorsePower() public view returns (uint256) {
    return s_horsePower;
  }
}
