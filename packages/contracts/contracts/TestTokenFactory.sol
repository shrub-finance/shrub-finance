// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MintBurnToken.sol";

contract TestTokenFactory is Ownable {

  address[] public tokens;

  mapping(address => uint) public tokenRates;

  event TokenCreated(address indexed token, string name, string symbol, uint rate);

  function createToken(string memory tokenName, string memory symbol, uint tokenRate) onlyOwner external returns (address) {
    address newToken = address(new MintBurnToken(tokenName, symbol));
    tokens.push(newToken);
    require(tokenRate > 0, "TestTokenFactory: Must have a value for tokenRate");
    tokenRates[newToken] = tokenRate;
    emit TokenCreated(newToken, tokenName, symbol, tokenRate);
    return newToken;
  }

  function mintToken(address token) external payable  {
    MintBurnToken(token).mint(msg.sender, msg.value * tokenRates[token]);
  }

  function burnToken(address token, uint amountToBurn) external {
    MintBurnToken erc20 = MintBurnToken(token);
    uint balance = erc20.balanceOf(msg.sender);
    require(balance >= amountToBurn, "TestTokenFactory: cannot burn more than you have");
    erc20.burn(msg.sender, amountToBurn);
    payable(msg.sender).transfer(amountToBurn / tokenRates[token]);
  }
}
