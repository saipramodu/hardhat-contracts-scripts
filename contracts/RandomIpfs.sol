// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// Abstract and interface contracts https://medium.com/coinmonks/solidity-tutorial-all-about-interfaces-f547d2869499
// We are creating a random NFT from 3 doggie NFTs using ERC721URIStorage.sol
// Users can mint a random doggie NFT from 3 available doggies... user will be assigned as a owner
// The uris of the nfts will be stored in IPFS
// ERC721URIStorage.sol is a abstract contract

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
//use yarn add --dev @openzeppelin/contracts to install the library
// To get a random number from chain link, we need below two contracts
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2 {
  /******** State Variables ***********/
  // Making state variables private - we need to use
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

  // We wll need keyHash, subId, minimumRequestConfirmations, callbackGasLimit, numWords to use request random words
  bytes32 immutable i_keyHash; //Keyhash is for the actual gas price ceiling
  uint64 immutable i_subId;
  uint16 constant c_minimumRequestConfirmations = 3;
  uint32 immutable i_callbackGasLimit; // callback gas limit is for gas ceiling
  uint32 constant c_numWords = 1;
  uint256 s_nftSerialNo;
  uint256 c_maxChanceValue = 100;
  string[3] s_dogTokenUris;

  /******* Enums  ***********/
  enum dogBreed {
    ST_BERNARD,
    PUG,
    SHIBA_INU
  }

  /*********** Events **********/
  event NftMinted(dogBreed breedSelected, address owner);

  /************ Mappings *************/
  mapping(uint256 => address) s_requestIDtoSenser;

  /***** Constructor ********/
  //Need to set the constructor for the ERC721,
  //   constructor(string memory name_, string memory symbol_) {
  //     _name = name_;
  //     _symbol = symbol_;
  // Also need to set the constructor for VRFConsumerBaseV2
  constructor(
    address _vrfCoordinator,
    bytes32 keyHash,
    uint64 subId,
    uint32 callbackGasLimit,
    string[3] memory dogTokenUris
  ) ERC721('Random IPFS NFT', 'RIN') VRFConsumerBaseV2(_vrfCoordinator) {
    i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    i_keyHash = keyHash;
    i_subId = subId;
    i_callbackGasLimit = callbackGasLimit;
    //We can assign s_nftSerialNo to 0 at start
    s_nftSerialNo = 0;
    //We can assign the doggie NFT uris
    s_dogTokenUris = dogTokenUris;
  }

  /******** Minting a Random Doggie **************/
  //To request a random number we need to use requestRandomWords from VRFCoordinatorV2Interface as below
  //     function requestRandomWords(
  //     bytes32 keyHash,
  //     uint64 subId,
  //     uint16 minimumRequestConfirmations,
  //     uint32 callbackGasLimit,
  //     uint32 numWords
  //   ) external returns (uint256 requestId);
  function requestDoggie() public returns (uint256) {
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_keyHash,
      i_subId,
      c_minimumRequestConfirmations,
      i_callbackGasLimit,
      c_numWords
    );
    s_requestIDtoSenser[requestId] = msg.sender;
    return (requestId);
  }

  // After we call the requestRandomWords from oracle function. it will send back a call back function
  // fulfillRandomWords which will include the randomWords (the needed random numbers)
  // function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual; from VRFConsumerBaseV2
  // Once the requestRandomWords() is called, oracle will spit out fulfillRandomWords() automatically
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal
    override
  {
    // We will need dog owner and the tokenID (to keep track of the NFT), usually one NFT contract will be an NFT collection
    // We need to keep track of token IDs and assign the owners
    // This function will not be called by the user as it us automatically done by the oracle, so we cannot use msg.sender to assign the ownership
    // We can use the uinique requestID to assign the owners
    address dogOwner = s_requestIDtoSenser[requestId];
    uint256 tokenId = s_nftSerialNo;
    s_nftSerialNo += 1;
    //To mint an NFT we can use _safeMint() from ERC721
    // function _safeMint(address to, uint256 tokenId) internal virtual
    _safeMint(dogOwner, tokenId);

    //Now we need to assign the dogUri
    //We will get a one large random number - we need a random number between 0 and 100
    uint256 randomNumber = randomWords[0] % 100;
    (uint256 breedNo, dogBreed breedSelected) = getBreed(randomNumber);

    //Inorder to set tokenUri, we can sue below function from ERC721URIStorage
    // function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual
    _setTokenURI(tokenId, s_dogTokenUris[breedNo]);
    emit NftMinted(breedSelected, dogOwner);
  }

  //We can have the limits to determine which doggie will be more rare than others
  //Having the array hers is gas efficient
  function getChanceArray() public view returns (uint256[3] memory) {
    // 0 - 9 -St. Bernard Dog
    // 10 - 29 - Pug
    // 30 - 100 - Shiba Inu dog
    return [10, 30, c_maxChanceValue];
  }

  function getBreed(uint256 randomNumber)
    public
    view
    returns (uint256, dogBreed)
  {
    uint256[3] memory chanceArray = getChanceArray();
    uint256 breedNo;
    dogBreed breedSelected;
    if (randomNumber < chanceArray[0]) {
      breedNo = 0;
      breedSelected = dogBreed.ST_BERNARD;
    } else {
      if (randomNumber > chanceArray[0] && randomNumber < chanceArray[1]) {
        breedNo = 1;
        breedSelected = dogBreed.PUG;
      } else {
        breedNo = 2;
        breedSelected = dogBreed.SHIBA_INU;
      }
    }
    return (breedNo, breedSelected);
  }
}
