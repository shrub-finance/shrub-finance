// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./OrderLib.sol";
import "./AppStateLib.sol";
import "hardhat/console.sol";

library FundsLib {

  using AppStateLib for AppStateLib.AppState;

  event Deposit(address user, address token, uint amount);
  event Withdraw(address user, address token, uint amount);

  function deposit(AppStateLib.AppState storage self, address token, uint amount, uint msgValue) internal {
    console.log('deposit');
    if(token != OrderLib.ZERO_ADDRESS) {
      require(ERC20(token).transferFrom(msg.sender, address(this), amount), "Must succeed in taking tokens");
      self.userTokenBalances[msg.sender][token] += amount;
    }
    if(msg.value > 0) {
      self.userTokenBalances[msg.sender][token] += msgValue;
    }
    emit Deposit(msg.sender, token, amount);
  }

  function withdraw(AppStateLib.AppState storage self, address token, uint amount) internal {
    console.log('withdraw');
    uint balance = getAvailableBalance(self, msg.sender, token);
    require(amount <= balance, "Cannot withdraw more than available balance");
    self.userTokenBalances[msg.sender][token] -= amount;
    if(token == OrderLib.ZERO_ADDRESS) {
      payable(msg.sender).transfer(amount);
    } else {
      require(ERC20(token).transfer(msg.sender, amount), "ERC20 transfer must succeed");
    }
    emit Withdraw(msg.sender, token, amount);
  }

  function getAvailableBalance(AppStateLib.AppState storage self, address user, address asset) internal view returns(uint) {
    console.log('getAvailableBalance');
    return self.userTokenBalances[user][asset] - self.userTokenLockedBalance[user][asset];
  }
}
