// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
pragma experimental ABIEncoderV2;
import "./libraries/OrderLib.sol";

contract HashUtil {
  using OrderLib for OrderLib.OrderCommon;
  using OrderLib for OrderLib.SmallOrder;
  using OrderLib for OrderLib.Order;
  using OrderLib for OrderLib.OptionType;

  function hashOrder(OrderLib.Order memory order) public pure returns (bytes32) {
    return OrderLib.hashOrder(order);
  }

  function hashSmallOrder(OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common) public pure returns (bytes32) {
    return OrderLib.hashSmallOrder(order, common);
  }

  function hashOrderCommon(OrderLib.OrderCommon memory common) public pure returns(bytes32) {
    return OrderLib.hashOrderCommon(common);
  }

  function validateSignature(address user, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure returns(bool) {
    return OrderLib.validateSignature(user, hash, v, r, s);
  }

  function getAddressFromSignedOrder(OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, OrderLib.Signature memory sig) public pure returns(address) {
    return OrderLib.getAddressFromSignedOrder(order, common, sig);
  }

  function getAddressFromOrderHash(bytes32 orderHash, OrderLib.Signature memory sig) public pure returns(address) {
    return OrderLib.getAddressFromOrderHash(orderHash, sig);
  }
}
