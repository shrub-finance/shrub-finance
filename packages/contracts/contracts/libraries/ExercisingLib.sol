// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

import "./OrderLib.sol";
import "./FundsLib.sol";
import "./FillingLib.sol";
import "./MathLib.sol";
import "./AppStateLib.sol";
import "hardhat/console.sol";

library ExercisingLib {
  using OrderLib for OrderLib.OrderCommon;
  using OrderLib for OrderLib.SmallOrder;
  using OrderLib for OrderLib.Order;
  using OrderLib for OrderLib.OptionType;

  event Exercised(address indexed user, bytes32 indexed positionHash, uint amount);
  event Claimed(address indexed user, bytes32 indexed positionHash, uint optionAmount, uint baseAssetAmount, uint quoteAssetAmount);

  function exercise(AppStateLib.AppState storage self, uint256 buyOrderSize, OrderLib.OrderCommon memory common) internal {
    console.log('exercise');
    address buyer = msg.sender;
    bytes32 positionHash = OrderLib.hashOrderCommon(common);

    require(self.userOptionPosition[buyer][positionHash] > 0, "Must have an open position to exercise");
    require(self.userOptionPosition[buyer][positionHash] >= int(buyOrderSize), "Cannot exercise more than owned");
    require(int(buyOrderSize) > 0, "buyOrderSize is too large");
    require(common.expiry >= block.timestamp, "Option has already expired");

    // user has exercised this many
    self.userOptionPosition[buyer][positionHash] -= int(buyOrderSize);

    uint256 totalPaid = MathLib.adjustWithRatio(buyOrderSize, common.strike);

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      require(self.positionPoolTokenBalance[positionHash][common.quoteAsset] >= buyOrderSize, "Pool must have enough funds");
      require(FundsLib.getAvailableBalance(self, buyer, common.baseAsset) >= totalPaid, "Buyer must have enough funds to exercise CALL");

      // deduct the quoteAsset from the pool
      self.positionPoolTokenBalance[positionHash][common.quoteAsset] -= buyOrderSize;

      // Reduce seller's locked capital and token balance of quote asset
      self.userTokenBalances[buyer][common.quoteAsset] += buyOrderSize;

      // Give the seller the buyer's funds, in terms of baseAsset
      self.positionPoolTokenBalance[positionHash][common.baseAsset] += totalPaid;

      // deduct strike * size from buyer
      self.userTokenBalances[buyer][common.baseAsset] -= totalPaid;
    }

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      require(self.positionPoolTokenBalance[positionHash][common.baseAsset] >= totalPaid, "Pool must have enough funds");
      require(FundsLib.getAvailableBalance(self, buyer, common.quoteAsset) >= buyOrderSize, "Buyer must have enough funds to exercise PUT");

      // deduct baseAsset from pool
      self.positionPoolTokenBalance[positionHash][common.baseAsset] -= totalPaid;

      // increase exercisee balance by strike * size
      self.userTokenBalances[buyer][common.baseAsset] += totalPaid;

      // credit the pool the amount of quote asset sold
      self.positionPoolTokenBalance[positionHash][common.quoteAsset] += buyOrderSize;

      // deduct balance of tokens sold
      self.userTokenBalances[buyer][common.quoteAsset] -= buyOrderSize;
    }
    emit Exercised(buyer, positionHash, buyOrderSize);
  }

  function claim(AppStateLib.AppState storage self, OrderLib.OrderCommon memory common) internal {
    console.log('claim');
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    require(self.userOptionPosition[msg.sender][positionHash] < 0, "Must have sold an option to claim");
    require(common.expiry < block.timestamp, "Cannot claim until options are expired");

    uint256 poolOwnership =  uint256(-1 * self.userOptionPosition[msg.sender][positionHash]);

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      // reset quoteAsset locked balance
      require(self.userTokenLockedBalance[msg.sender][common.quoteAsset] >= poolOwnership, "Claimer must have enough tokens locked to unlock them");
      require(self.userTokenBalances[msg.sender][common.quoteAsset] >= poolOwnership, "Claimer must have enough tokens locked to unlock them");
      self.userTokenLockedBalance[msg.sender][common.quoteAsset] -= poolOwnership;
      self.userTokenBalances[msg.sender][common.quoteAsset] -= poolOwnership;
    }

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      // reset baseAsset locked balance
      require(self.userTokenLockedBalance[msg.sender][common.baseAsset] >= poolOwnership, "Claimer must have enough tokens locked to unlock them");
      require(self.userTokenBalances[msg.sender][common.baseAsset] >= poolOwnership, "Claimer must have enough tokens locked to unlock them");
      self.userTokenLockedBalance[msg.sender][common.baseAsset] -= poolOwnership;
      self.userTokenBalances[msg.sender][common.baseAsset] -= poolOwnership;
    }

    uint256 totalSupply = self.positionPoolTokenTotalSupply[positionHash];

    uint256 quoteBalance = self.positionPoolTokenBalance[positionHash][common.quoteAsset];
    uint256 quoteBalanceOwed = poolOwnership / totalSupply * quoteBalance;

    uint256 baseBalance = self.positionPoolTokenBalance[positionHash][common.baseAsset];
    uint256 baseBalanceOwed = poolOwnership / totalSupply * baseBalance;

    self.userTokenBalances[msg.sender][common.baseAsset] += baseBalanceOwed;
    self.userTokenBalances[msg.sender][common.quoteAsset] += quoteBalanceOwed;

    // reduce pool size by amount claimed
    require(self.positionPoolTokenTotalSupply[positionHash] >= poolOwnership, "The pool total size should exceed claimed amount");
    self.positionPoolTokenTotalSupply[positionHash] -= poolOwnership;
    self.userOptionPosition[msg.sender][positionHash] = 0;
    emit Claimed(msg.sender, positionHash, poolOwnership, baseBalanceOwed, quoteBalanceOwed);
  }
}
