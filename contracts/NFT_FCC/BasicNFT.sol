// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

//In this project we are minting a same dog of metadata stored offchain using ERC 721
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

//Inheriting ERC721 contract
contract BasicNFT is ERC721 {
  /****** State Variables Initialization ********/
  uint256 private s_tokenId;

  // we can use constant to set the token uri, immutable needs to be initialised in constructor
  string public constant TOKEN_URI =
    'ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json';

  /******** Constructor ********/
  // We need to also call constructor of inheritred Contract - constructor(string memory name_, string memory symbol_)
  constructor() ERC721('Doggie collection', 'Doggie') {
    s_tokenId = 0;
  }

  /******* Minting NFT ********/
  // For NFT minting we will need the mint function and also the token URI
  // token URIs are the link to metadata which again will point to the location of NFT

  function mintNFT() public {
    // function _safeMint(address to, uint256 tokenId)
    _safeMint(msg.sender, s_tokenId);

    //after minting, we can increment the tokenId
    s_tokenId += 1;
  }

  // now we can initliaze the tokenUri, the NFT market places will taken the NFT uri from here
  // the ERC721 uses a base URI to concotanate URI with token Id, we can override the function to return a URI
  //   function tokenURI(uint256 tokenId)
  function tokenURI(
    uint256 /*tokenId*/
  ) public pure override returns (string memory) {
    return TOKEN_URI;
  }

  /********* Getter functions ***********/
  function getTokenId() public view returns (uint256) {
    return s_tokenId;
  }
}
