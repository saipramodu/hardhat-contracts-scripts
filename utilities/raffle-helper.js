const { ethers } = require('hardhat');

const networkconfig = {
  5: {
    network_name: 'Goerli',
    VRF_address: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
    entranceFee: ethers.utils.parseEther('0.01'),
    keyhash:
      '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
    subId: '8002',
    callbackGasLimit: '500000', //500,000 gas limit
  },
  80001: {
    network_name: 'polygon',
    VRF_address: '0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed',
    entranceFee: ethers.utils.parseEther('0.05'),
    keyhash:
      '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f',
    subId: '0',
    callbackGasLimit: '500000', //500,000 gas limit
  },
  97: {
    network_name: 'bnb',
    VRF_address: '0x6A2AAd07396B36Fe02a22b33cf443582f682c82f',
    entranceFee: ethers.utils.parseEther('0.06'),
    keyhash:
      '0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314',
    subId: '0',
    callbackGasLimit: '500000', //500,000 gas limit
  },
  31337: {
    network_name: 'localhost',
    //if working on local blockchain or the hardhat, we do not have the oracle contracts
    //what we need to do is to create a mock contract and then use the address
    // after deploying the mock contract to local chain - we can use the address of deployed mock contract
    entranceFee: ethers.utils.parseEther('1'),
    // Mocks do not use the gas lane, we can use anything
    keyhash:
      '0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314',
    callbackGasLimit: '500000', //500,000 gas limit
  },
};

const developmentChains = ['hardhat', 'localhost'];
//Below is the way to export using module.exports
module.exports = { networkconfig, developmentChains };
