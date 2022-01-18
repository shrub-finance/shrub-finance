// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import "hardhat/console.sol";

contract TokenFaucet is Ownable {

  address[] public tokens;

  mapping(address => uint) public tokenRates;

  function addToken(address token, uint tokenRate) onlyOwner external returns (address) {
//    console.log('addToken');
    tokens.push(token);
    require(tokenRate > 0, "TokenFaucet: Must have a value for tokenRate");
    tokenRates[token] = tokenRate;
    return token;
  }

  function buyFromFaucet(address token) external payable  {
//    console.log('buyFromFaucet');
    ERC20(token).transfer(msg.sender, msg.value * tokenRates[token]);
  }

  function sellToFaucet(address token, uint amountToSell) external {
//    console.log('sellToFaucet');
    ERC20 erc20 = ERC20(token);
    require(erc20.transferFrom(msg.sender, address(this), amountToSell), "Failed to transfer tokens");
    payable(msg.sender).transfer(amountToSell / tokenRates[token]);
  }
}
