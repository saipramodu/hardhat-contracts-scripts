// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

//In this contract we are trying to mint an NFT based on the price of ETH
// If price of eth is below certain limit, one NFT will be minted or else another one will be minted
// If ETH price in usd > someNumber : Smile image will be minted else sadface will be minted
// Here we are trying to store the image completely on chain unlike IPFS we did in RandomIpfs

//We can use ERC 721 contract
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import 'base64-sol/base64.sol';
//Aggregator v3 interface is to get the latest ETH to USD price
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

contract DynamicSvgNft is ERC721 {
  /**** State Variables *******/
  uint256 s_nftSerialNo;
  string private s_lowImgSvgUri;
  string private s_highImgSvgUri;
  int256 private immutable i_highValue;
  AggregatorV3Interface private immutable i_priceFeedContract;

  /***** Constructor *******/
  constructor(
    string memory lowSvg,
    string memory highsvg,
    address priceFeedAddress,
    int256 highValue
  ) ERC721('Dynamic SVG NFT', 'DSN') {
    s_nftSerialNo = 0;
    s_highImgSvgUri = svgImgToBase64URI(highsvg);
    s_lowImgSvgUri = svgImgToBase64URI(lowSvg);
    //Getting the contract contract_name_variable = contract_name(deployed contract address)
    i_priceFeedContract = AggregatorV3Interface(priceFeedAddress);
    //The value we set during deploy will have 18 decimals, eth price will be in 8 decimals
    // so we need to reduce 10 decimals in high value
    i_highValue = highValue / 1e10;
  }

  /**** Setting the Token Uri *********/

  //Important thing about NFT minting is that we need to provide the tokenURI - which points to a metadata
  // of the NFT - this is what gives the info about the NFTs
  // We can set the tokenURI using function tokenURI(uint256 tokenId) from ERC 721
  function tokenURI(
    uint256 /*tokenId*/
  ) public view override returns (string memory) {
    //Let's set the metadata we want, in randomIPFs we did not create this metadata as the metadata is
    //created off chain in IPFS, only the link to metadata was needed in randomIPFS
    string memory metaDataTemplate = (
      '{"name": "Dynamic SVG", "description":"A dynamic cool NFT","image":"'
    );
    // We need to convert this metadata into base64 encoded format to store it on chain, we can use base64-sol package to do this
    //from base64-sol function encode(bytes memory data) internal pure returns (string memory)
    //To encode to base64 we need to make the string to bytes
    bytes memory metaDataTemplateinBytes = bytes(metaDataTemplate);
    // Base64 contract is a library, we can call the functions in it using Contract_name.function
    string memory base64_metaData = Base64.encode(metaDataTemplateinBytes);
    //The token URI needs to be baseURI + base64_Metadata
    string memory baseUri = _baseURI();
    //Logic for img uri
    int256 ethPrice = getETHinUSD();
    string memory imgUri = s_lowImgSvgUri;
    if (ethPrice > i_highValue) {
      imgUri = s_highImgSvgUri;
    }
    //The way to conccatonate is using abi.encodePacked, I have breaked the total uri into pieces
    string memory fullTokenUri = string(
      abi.encodePacked(baseUri, base64_metaData, imgUri, '"}')
    );
    return fullTokenUri;
  }

  //For onchain NFTs, we need to add data:application/json;base64 as the baseURI instead of hashed CID used in IPFS
  // We can set this by using function _baseURI() from ERC721
  function _baseURI() internal pure override returns (string memory) {
    //The token URI needs to be baseURI + base64_Metadata
    return 'data:application/json;base64,';
  }

  /****** Making base64 encodement of image ********/

  // If you see the metadata, we need to provide the uri of the image, but we are storing the image on chain
  // and not in any other location. To store anything on chain - it should be in machine level format
  // ie. we need to make the image itself as an encoded base64
  // If we add 'data:image/svg+xml;base64,' + 'image base64 encodement' to form the image uri
  // putting this in image uri in browser we can see the svg
  // SVG image is actually just a html code which can be converted to base64

  function svgImgToBase64URI(string memory svg)
    public
    pure
    returns (string memory)
  {
    string memory baseImgUri = 'data:image/svg+xml;base64,';
    //We can use encode function from base64-sol function encode(bytes memory data)
    string memory base64_svgImg = Base64.encode(bytes(svg));
    string memory fullImgUri = string(
      abi.encodePacked(baseImgUri, base64_svgImg)
    );
    return fullImgUri;
  }

  /******** Getting Price of ETH in USD *********/
  function getETHinUSD() public view returns (int256) {
    //using function latestRoundData() from AggregatorV3Interface
    (, int256 price, , , ) = i_priceFeedContract.latestRoundData();
    return price;
  }

  /***** Minting NFT *********/

  function mintNFT() external {
    //To mint an NFT we can use _safeMint() from ERC721
    // function _safeMint(address to, uint256 tokenId) internal virtual => address to will be the owner of the NFT
    uint256 tokenId = s_nftSerialNo;
    s_nftSerialNo += 1;
    _safeMint(msg.sender, tokenId);
  }
}
