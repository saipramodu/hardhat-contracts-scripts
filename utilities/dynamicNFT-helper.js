const network_config = {
  5: {
    network_name: 'Goerli',
    _priceFeedAddress: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
  },
  80001: {
    network_name: 'polygon',
    _priceFeedAddress: '0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A',
  },
  97: {
    network_name: 'bnb',
    _priceFeedAddress: '0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7',
  },
  31337: {
    network_name: 'localhost',
    _priceFeedAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
};

const developmentChains = ['localhost', 'hardhat'];

module.exports = { network_config, developmentChains };
