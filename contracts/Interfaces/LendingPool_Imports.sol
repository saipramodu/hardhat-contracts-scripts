// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol';
import '@aave/protocol-v2/contracts/interfaces/ILendingPool.sol';

// We are importing both ILendingPoolAddressesProvider and ILendingPool interfaces so that
// we can create the ABI using compile - and use the ABI in aaveBorrow.js to interact
