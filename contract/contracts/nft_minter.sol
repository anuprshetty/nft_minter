// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFTMinter is ERC721Enumerable, Ownable {
    using Strings for uint256;
    string public baseURI = "";
    string public baseExtension = ".json";
    uint256 public cost = 0.0001 ether;
    uint256 public maxSupply = 1000;
    uint256 public maxMintAmount = 5;
    bool public paused = false;

    constructor(
        string memory _name,
        string memory _symbol
    )
        ERC721(
            bytes(_name).length > 0 ? _name : "NFT Collection Null",
            bytes(_symbol).length > 0 ? _symbol : "COL-NUL"
        )
    {}

    function mint(address _to, uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        require(!paused, "minting is paused");
        require(_mintAmount > 0, "mint amount is less than 1");
        require(_mintAmount <= maxMintAmount, "max mint amount exceeded");
        require((supply + _mintAmount) <= maxSupply, "max supply exceeded");

        if (msg.sender != owner()) {
            require(
                msg.value == cost * _mintAmount,
                "Need to send 0.0001 ether for each token to be minted"
            );
        }

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(_to, supply + i);
        }
    }

    function withdraw() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        require(
            _newmaxMintAmount > 0 && _newmaxMintAmount <= maxSupply,
            "Invalid maxMintAmount"
        );
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _NFTMetadataFolderCID) public onlyOwner {
        baseURI = bytes(_NFTMetadataFolderCID).length > 0
            ? string(abi.encodePacked("ipfs://", _NFTMetadataFolderCID, "/"))
            : "";
    }

    function setBaseExtension(
        string memory _newBaseExtension
    ) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function walletOfOwner(
        address _owner
    ) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
