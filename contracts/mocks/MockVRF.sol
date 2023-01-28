// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol';

//For local chain, we need a mock contract address of the large contract. Chainlink already has this mock contract
// which we can deploy and use its address

/**
 * @notice the mock contract is not an interface, ie. we are creating a mock contract of the larger contract
 * we can then pass this contract address to the interface normally
 */
