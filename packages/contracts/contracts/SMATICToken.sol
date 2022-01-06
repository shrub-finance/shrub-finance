// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";


contract SMATICToken is ERC20 {
  constructor() ERC20("Shrub MATIC", "SMATIC") {
    _mint(msg.sender, 1000000000000e18);
  }
}
