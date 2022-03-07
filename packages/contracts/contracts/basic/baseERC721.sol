// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BaseERC721 is ERC721 {
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}
}
