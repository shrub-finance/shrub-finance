// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


contract MintBurnToken is ERC20, Ownable {
  constructor (string memory name, string memory symbol) ERC20(name, symbol) {}

  function mint(address mintTo, uint amount) public onlyOwner {
    console.log('mint');
    _mint(mintTo, amount);
  }


  function burn(address burnFrom, uint amount) public onlyOwner {
    console.log('burn');
    _burn(burnFrom, amount);
  }
}
