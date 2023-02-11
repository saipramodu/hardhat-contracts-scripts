// SPDX-License-Identifier: MIT
pragma solidity ^0.4.19;

/**
 * @dev Interface of Weth contract - which is a ERC 20 token
 * Functions are similar to ERC-20 standard, with addition of deposit and withdraw
 *
 * @notice User can deposit the ETH and convert it to WETH and then withdraw the ETH back
 */

interface IWeth {
  function allowance(address owner, address spender)
    external
    view
    returns (uint256 remaining);

  function approve(address spender, uint256 value)
    external
    returns (bool success);

  function balanceOf(address owner) external view returns (uint256 balance);

  function decimals() external view returns (uint8 decimalPlaces);

  function name() external view returns (string memory tokenName);

  function symbol() external view returns (string memory tokenSymbol);

  function totalSupply() external view returns (uint256 totalTokensIssued);

  function transfer(address to, uint256 value) external returns (bool success);

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external returns (bool success);

  function deposit() external payable;

  function withdraw(uint256 wad) external;
}
