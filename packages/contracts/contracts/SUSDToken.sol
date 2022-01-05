// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";


contract SUSDToken is ERC20 {
  constructor() ERC20("Shrub USD", "SUSD") {
    _mint(msg.sender, 1000000000000e18);
  }
}
