// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgroNFT — Titulo de propriedade rural tokenizado
/// @notice Cada NFT representa um imovel rural unico usado como colateral
contract AgroNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("AgroNFT", "ANFT") Ownable(msg.sender) {}

    /// @notice Emite NFT representando titulo rural para um agricultor
    /// @param to Endereco do agricultor
    /// @param uri URI com metadados do imovel (IPFS recomendado)
    function safeMint(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
}
