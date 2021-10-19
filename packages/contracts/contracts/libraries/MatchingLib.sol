pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import "./OrderLib.sol";
import "./FillingLib.sol";
import "./AppStateLib.sol";

library MatchingLib {
  using AppStateLib for AppStateLib.AppState;

  struct MatchingRound {
    OrderLib.SmallOrder sellOrder;
    OrderLib.OrderCommon common;
    OrderLib.Signature sellSig;
    OrderLib.SmallOrder buyOrder;
    OrderLib.Signature buySig;
  }

  struct PartialMatchRound {
    bytes32 sellOrderHash;
    bytes32 buyOrderHash;
    address seller;
    address buyer;
    bytes32 positionHash;
  }

  event OrderMatched(address indexed seller, address indexed buyer, bytes32 positionHash, OrderLib.SmallOrder sellOrder, OrderLib.SmallOrder buyOrder, OrderLib.OrderCommon common, bytes32 buyOrderId, bytes32 sellOrderId);
  event Cancelled(address indexed user, bytes32 indexed positionHash, uint nonce);

  function getCurrentNonce(AppStateLib.AppState storage self, address user, OrderLib.OrderCommon memory common) internal view returns(uint) {
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    return self.userPairNonce[user][positionHash];
  }

  function getCurrentNonce(AppStateLib.AppState storage self, address user, bytes32 commonHash) internal view returns(uint) {
    return self.userPairNonce[user][commonHash];
  }


  function checkValidNonce(AppStateLib.AppState storage self, address user, bytes32 positionHash, OrderLib.SmallOrder memory order, bytes32 orderHash) internal view returns(bool) {
    if(getCurrentNonce(self, user, positionHash) == order.nonce - 1) {
      return true;
    } else {
      return self.orderPartialFill[orderHash] > 0;
    }
  }


  function matchOrder(AppStateLib.AppState storage self, OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder, OrderLib.OrderCommon memory common, OrderLib.Signature memory sellSig, OrderLib.Signature memory buySig) internal {

    (address buyer, address seller, bytes32 positionHash) = doPartialMatch(self, sellOrder, buyOrder, common, sellSig, buySig);
    bytes32 buyOrderId = OrderLib.hashSmallOrder(buyOrder, common);
    bytes32 sellOrderId = OrderLib.hashSmallOrder(sellOrder, common);
    emit OrderMatched(seller, buyer, positionHash, sellOrder, buyOrder, common, buyOrderId, sellOrderId);

    if(sellOrder.size > buyOrder.size) {
      FillingLib.partialFill(self, sellOrder, common, buyOrder.size);
    }

    if(sellOrder.size < buyOrder.size) {
      FillingLib.partialFill(self, buyOrder, common, sellOrder.size);
    }

    self.userPairNonce[buyer][positionHash] = buyOrder.nonce;
    self.userPairNonce[seller][positionHash] = sellOrder.nonce;
  }


  function getPartialMatchRound(OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder, OrderLib.OrderCommon memory common, OrderLib.Signature memory sellSig, OrderLib.Signature memory buySig) internal pure returns (PartialMatchRound memory round) {
    bytes32 sellOrderHash = OrderLib.hashSmallOrder(sellOrder, common);
    bytes32 buyOrderHash = OrderLib.hashSmallOrder(buyOrder, common);

    address seller = OrderLib.getAddressFromOrderHash(sellOrderHash, sellSig);
    address buyer = OrderLib.getAddressFromOrderHash(buyOrderHash, buySig);

    bytes32 positionHash = OrderLib.hashOrderCommon(common);

    return PartialMatchRound({
      sellOrderHash: sellOrderHash,
      buyOrderHash: buyOrderHash,
      seller: seller,
      buyer: buyer,
      positionHash: positionHash
    });
  }

  function doPartialMatch(AppStateLib.AppState storage self, OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder, OrderLib.OrderCommon memory common, OrderLib.Signature memory sellSig, OrderLib.Signature memory buySig)
  internal returns(address, address, bytes32) {
    require(common.expiry > block.timestamp, "Cannot match orders for expired options");
    require(OrderLib.checkOrderMatches(sellOrder, buyOrder), "Buy and sell order do not match");
    PartialMatchRound memory round = getPartialMatchRound(sellOrder, buyOrder, common, sellSig, buySig);
    require(round.seller != round.buyer, "Seller and Buyer must be different");
    require(checkValidNonce(self, round.seller, round.positionHash, sellOrder, round.sellOrderHash), "Seller nonce incorrect");
    require(checkValidNonce(self, round.buyer, round.positionHash, buyOrder, round.buyOrderHash), "Buyer nonce incorrect");

    sellOrder.size = FillingLib.getOrderSize(self, sellOrder, round.sellOrderHash);
    buyOrder.size = FillingLib.getOrderSize(self, buyOrder, round.buyOrderHash);

    (uint fillSize, uint adjustedPrice) = FillingLib.getAdjustedPriceAndFillSize(sellOrder, buyOrder);

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      FillingLib.fillCallOption(self, round.buyer, round.seller, common, fillSize, adjustedPrice, round.positionHash);
    }

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      FillingLib.fillPutOption(self, round.buyer, round.seller, common, fillSize, adjustedPrice, round.positionHash);
    }

    self.userOptionPosition[round.seller][round.positionHash] -= int(fillSize);
    self.userOptionPosition[round.buyer][round.positionHash] += int(fillSize);

    return (round.buyer, round.seller, round.positionHash);
  }


  function getMatchingRound(
    OrderLib.SmallOrder[] memory sellOrders,
    OrderLib.SmallOrder[] memory buyOrders,
    OrderLib.OrderCommon[] memory commons,
    OrderLib.Signature[] memory sellSigs,
    OrderLib.Signature[] memory buySigs,
    uint sellIndex,
    uint buyIndex
  ) internal pure returns (MatchingRound memory round) {
    return MatchingRound({
      sellOrder: sellOrders[sellIndex],
      common: commons[sellIndex],
      sellSig: sellSigs[sellIndex],
      buyOrder: buyOrders[buyIndex],
      buySig: buySigs[buyIndex]
    });
  }

  function matchOrders(AppStateLib.AppState storage self, OrderLib.SmallOrder[] memory sellOrders, OrderLib.SmallOrder[] memory buyOrders, OrderLib.OrderCommon[] memory commons, OrderLib.Signature[] memory sellSigs, OrderLib.Signature[] memory buySigs) internal {
    uint sellIndex = 0;
    uint buyIndex = 0;
    uint sellFilled = 0;
    uint buyFilled = 0;
    while(sellIndex < sellOrders.length && buyIndex < buyOrders.length) {
      MatchingRound memory round = getMatchingRound(sellOrders, buyOrders, commons, sellSigs, buySigs, sellIndex, buyIndex);

      (address buyer, address seller, bytes32 positionHash) = doPartialMatch(self, round.sellOrder, round.buyOrder, round.common, round.sellSig, round.buySig);

      if(round.sellOrder.size - sellFilled >= round.buyOrder.size - buyFilled) {
        sellFilled += round.buyOrder.size;
        buyIndex++;
        if(sellFilled == round.sellOrder.size || buyIndex == buyOrders.length) {
          sellIndex++;
          self.userPairNonce[seller][positionHash] = round.sellOrder.nonce;
          FillingLib.partialFill(self, round.sellOrder, round.common, sellFilled);
          sellFilled = 0;
        }
        emit OrderMatched(seller, buyer, positionHash, round.sellOrder, round.buyOrder, round.common, OrderLib.hashSmallOrder(round.buyOrder, round.common), OrderLib.hashSmallOrder(round.sellOrder, round.common));
        self.userPairNonce[buyer][positionHash] = round.buyOrder.nonce;
      } else if (round.sellOrder.size - sellFilled < round.buyOrder.size - buyFilled) {
        buyFilled += round.sellOrder.size;
        sellIndex++;
        if(buyFilled == round.buyOrder.size || sellIndex == sellOrders.length) {
          buyIndex++;
          self.userPairNonce[buyer][positionHash] = round.buyOrder.nonce;
          FillingLib.partialFill(self, round.buyOrder, round.common, buyFilled);
          buyFilled = 0;
        }
        emit OrderMatched(seller, buyer, positionHash, round.sellOrder, round.buyOrder, round.common, OrderLib.hashSmallOrder(round.buyOrder, round.common), OrderLib.hashSmallOrder(round.sellOrder, round.common));
        self.userPairNonce[seller][positionHash] = round.sellOrder.nonce;
      }
    }
  }


  function cancel(AppStateLib.AppState storage self, OrderLib.Order memory order) internal {
    OrderLib.OrderCommon memory common = OrderLib.getCommonFromOrder(order);
    bytes32 commonHash = OrderLib.hashOrderCommon(common);
    bytes32 orderHash = OrderLib.hashOrder(order);
    if(self.orderPartialFill[orderHash] > 0) {
      self.orderPartialFill[orderHash] = 0;
    } else {
      require(order.nonce - 1 >= getCurrentNonce(self, msg.sender, commonHash), "Invalid order nonce");
      self.userPairNonce[msg.sender][commonHash] = order.nonce;
    }
    emit Cancelled(msg.sender, commonHash, order.nonce);
  }
}
