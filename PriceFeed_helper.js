module.exports = {
  networkConfig: {
    5: {
      network_name: 'goerli',
      //priceFeedAddress from https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=ethereum
      priceFeedAddress: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    },

    80001: {
      network_name: 'polygon',
      priceFeedAddress: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
    },

    97: {
      network_name: 'bnb',
      //BNB Chain Testnet - ETH / USD
      priceFeedAddress: '0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7',
    },

    31337: {
      network_name: 'local-hardhat',
      //if working on local blockchain or the hardhat, we do not have the oracle price feed contracts
      //what we need to do is to create a mock price feed contract and then use the address
      // after deploying the mock contract to local chain - we can use the address of deployed mock contract
      priceFeedAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
  },
};
