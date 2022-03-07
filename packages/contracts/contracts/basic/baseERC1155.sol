// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract BaseERC1155 is ERC1155 {
    constructor(string memory _baseUri) ERC1155(_baseUri) {}
}
