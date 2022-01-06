// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;


import "./OrderLib.sol";
import "./FundsLib.sol";
import "./MathLib.sol";
import "./AppStateLib.sol";
import "hardhat/console.sol";
import "./MatchingLib.sol";

library FillingLib {

  using AppStateLib for AppStateLib.AppState;

  function getOrderSize(AppStateLib.AppState storage self, OrderLib.SmallOrder memory order, bytes32 orderHash) internal view returns (uint) {
    console.log('getOrderSize');
    if(self.orderPartialFill[orderHash] == 0) {
      return order.size;
    } else {
      return self.orderPartialFill[orderHash];
    }
  }

  function getAdjustedPriceAndFillSize(OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder, MatchingLib.MatchCounter memory sellCounter, MatchingLib.MatchCounter memory buyCounter) internal view returns (uint, uint) {
    console.log('getAdjustedPriceAndFillSize');
    uint fillSize = MathLib.min(sellOrder.size - sellCounter.filled, buyOrder.size - buyCounter.filled);
    uint adjustedPrice = fillSize * sellOrder.price / sellOrder.size;

//    console.log('buyerFilledPrice');
//    console.log(buyOrder.price);
//    console.log(buyCounter.filledPrice);

    uint buyerAdjustedPrice = fillSize * (buyOrder.price - buyCounter.filledPrice) / (buyOrder.size - buyCounter.filled);
//    console.log('fillSize');
//    console.log(fillSize);
//    console.log('adjustedPrice');
//    console.log(adjustedPrice);
//    console.log('buyerAdjustedPrice');
//    console.log(buyerAdjustedPrice);
    require(adjustedPrice <= buyerAdjustedPrice, "Seller order price does not satisfy Buyer order price");

    return (fillSize, adjustedPrice);
  }


  function partialFill(AppStateLib.AppState storage self, OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, uint filledSize) internal {
    console.log('partialFill');
    if(order.size - filledSize > 0) {
      self.orderPartialFill[OrderLib.hashSmallOrder(order, common)] = order.size - filledSize;
    }
  }

  function fillCallOption(AppStateLib.AppState storage self, address buyer, address seller, OrderLib.OrderCommon memory common, uint fillSize, uint adjustedPrice, bytes32 positionHash) internal {
    console.log('fillCallOption');
    require(FundsLib.getAvailableBalance(self, seller, common.quoteAsset) >= fillSize, "Call Seller must have enough free collateral");
//    console.log(buyer);
//    console.log(seller);
//    console.log(common.baseAsset);
//    console.log(FundsLib.getAvailableBalance(self, buyer, common.baseAsset));
//    console.log(adjustedPrice);
    require(FundsLib.getAvailableBalance(self, buyer, common.baseAsset) >= adjustedPrice, "Call Buyer must have enough free collateral");

    self.userTokenLockedBalance[seller][common.quoteAsset] += fillSize;
    self.positionPoolTokenBalance[positionHash][common.quoteAsset] += fillSize;
    self.positionPoolTokenTotalSupply[positionHash] += fillSize;

    self.userTokenBalances[seller][common.baseAsset] += adjustedPrice;
    self.userTokenBalances[buyer][common.baseAsset] -= adjustedPrice;


    // unlock buyer's collateral if this user was short
    if(self.userOptionPosition[buyer][positionHash] < 0 && self.userTokenLockedBalance[buyer][common.quoteAsset] > 0) {
      self.userTokenLockedBalance[buyer][common.quoteAsset] -= MathLib.min(fillSize, self.userTokenLockedBalance[buyer][common.quoteAsset]);
    }
  }

  function fillPutOption(AppStateLib.AppState storage self, address buyer, address seller, OrderLib.OrderCommon memory common, uint fillSize, uint adjustedPrice, bytes32 positionHash) internal {
    console.log('fillPutOption');
    uint lockedCapital = MathLib.adjustWithRatio(fillSize, common.strike);

    require(FundsLib.getAvailableBalance(self, seller, common.baseAsset) >= lockedCapital, "Put Seller must have enough free collateral");
    require(FundsLib.getAvailableBalance(self, buyer, common.baseAsset) >= adjustedPrice, "Put Buyer must have enough free collateral");

    self.userTokenLockedBalance[seller][common.baseAsset] += lockedCapital;
    self.positionPoolTokenBalance[positionHash][common.baseAsset] += lockedCapital;
    self.positionPoolTokenTotalSupply[positionHash] += lockedCapital;

    self.userTokenBalances[seller][common.baseAsset] += adjustedPrice;
    self.userTokenBalances[buyer][common.baseAsset] -= adjustedPrice;

    // unlock buyer's collateral if this user was short
    if(self.userOptionPosition[buyer][positionHash] < 0 && self.userTokenLockedBalance[buyer][common.baseAsset] > 0) {
      self.userTokenLockedBalance[buyer][common.baseAsset] -= MathLib.min(lockedCapital, self.userTokenLockedBalance[buyer][common.baseAsset]);
    }
  }
}
