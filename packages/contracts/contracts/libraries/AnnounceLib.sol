// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

import "./OrderLib.sol";
import "./MatchingLib.sol";
import "./MathLib.sol";
import "./AppStateLib.sol";
import "hardhat/console.sol";

library AnnounceLib {

  using AppStateLib for AppStateLib.AppState;

  event OrderAnnounce(OrderLib.OrderCommon common, bytes32 indexed positionHash, address indexed user, OrderLib.SmallOrder order, OrderLib.Signature sig, bytes32 orderId);


  function announce(AppStateLib.AppState storage self, OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, OrderLib.Signature memory sig) internal {
    console.log('announce');
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    bytes32 orderId = OrderLib.hashSmallOrder(order, common);
    address user = OrderLib.getAddressFromSignedOrder(order, common, sig);
    require(MatchingLib.getCurrentNonce(self, user, positionHash) == order.nonce - 1, "User nonce incorrect");

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      if(order.isBuy) {
        require(FundsLib.getAvailableBalance(self, user, common.baseAsset) >= order.price, "Call Buyer must have enough free collateral");
      } else {
        require(FundsLib.getAvailableBalance(self, user, common.quoteAsset) >= order.size, "Call Seller must have enough free collateral");
      }
    }

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      if(order.isBuy) {
        require(FundsLib.getAvailableBalance(self, user, common.baseAsset) >= order.price, "Put Buyer must have enough free collateral");
      } else {
        require(FundsLib.getAvailableBalance(self, user, common.baseAsset) >= MathLib.adjustWithRatio(order.size, common.strike), "Put Seller must have enough free collateral");
      }
    }

    emit OrderAnnounce(common, positionHash, user, order, sig, orderId);
  }


  function announceMany(AppStateLib.AppState storage self, OrderLib.SmallOrder[] memory orders, OrderLib.OrderCommon[] memory commons, OrderLib.Signature[] memory sigs) internal {
    console.log('announceMany');
    require(orders.length == commons.length, "Array length mismatch");
    require(orders.length == sigs.length, "Array length mismatch");
    for(uint i = 0; i < orders.length; i++) {
      announce(self, orders[i], commons[i], sigs[i]);
    }
  }
}
