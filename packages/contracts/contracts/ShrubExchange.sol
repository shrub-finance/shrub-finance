// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./libraries/OrderLib.sol";
import "./libraries/FundsLib.sol";
import "./libraries/FillingLib.sol";
import "./libraries/MatchingLib.sol";
import "./libraries/AnnounceLib.sol";
import "./libraries/ExercisingLib.sol";
import "./libraries/AppStateLib.sol";
import "./libraries/TokenizeLib.sol";

contract ShrubExchange {

  using AppStateLib for AppStateLib.AppState;
  using OrderLib for OrderLib.OrderCommon;
  using OrderLib for OrderLib.SmallOrder;
  using OrderLib for OrderLib.Order;
  using OrderLib for OrderLib.OptionType;
  using AppStateLib for AppStateLib.PositionToken;
  using AppStateLib for AppStateLib.ExposureType;

  event Deposit(address user, address token, uint amount);
  event Withdraw(address user, address token, uint amount);
  event OrderAnnounce(OrderLib.OrderCommon common, bytes32 indexed positionHash, address indexed user, OrderLib.SmallOrder order, OrderLib.Signature sig, bytes32 orderId);
  event OrderMatched(address indexed seller, address indexed buyer, bytes32 positionHash, OrderLib.SmallOrder sellOrder, OrderLib.SmallOrder buyOrder, OrderLib.OrderCommon common, bytes32 buyOrderId, bytes32 sellOrderId);
  event Claimed(address indexed user, bytes32 indexed positionHash, uint optionAmount, uint baseAssetAmount, uint quoteAssetAmount);
  event Exercised(address indexed user, bytes32 indexed positionHash, uint amount);
  event Cancelled(address indexed user, bytes32 indexed positionHash, uint nonce);


  bytes32 public ORDER_TYPEHASH = OrderLib.ORDER_TYPEHASH;
  bytes32 public COMMON_TYPEHASH = OrderLib.COMMON_TYPEHASH;

  AppStateLib.AppState state;

  function getCurrentNonce(address user, OrderLib.OrderCommon memory common) public view returns(uint) {
    return MatchingLib.getCurrentNonce(state, user, common);
  }

  function getCurrentNonceFromHash(address user, bytes32 commonHash) public view returns(uint) {
    return MatchingLib.getCurrentNonce(state, user, commonHash);
  }

  function getAvailableBalance(address user, address asset) public view returns(uint) {
    return FundsLib.getAvailableBalance(state, user, asset);
  }

  function deposit(address token, uint amount) public payable {
    FundsLib.deposit(state, token, amount, msg.value);
  }

  function depositAndAnnounce(address token, uint amount, OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, OrderLib.Signature memory sig) public payable {
    deposit(token, amount);
    announce(order, common, sig);
  }

  function depositAndMatchMany(address token, uint amount, OrderLib.SmallOrder[] memory sellOrders, OrderLib.SmallOrder[] memory buyOrders, OrderLib.OrderCommon[] memory commons, OrderLib.Signature[] memory sellSigs, OrderLib.Signature[] memory buySigs) public payable {
    deposit(token, amount);
    matchOrders(sellOrders, buyOrders, commons, sellSigs, buySigs);
  }

  function withdraw(address token, uint amount) public {
    FundsLib.withdraw(state, token, amount);
  }

  function matchOrders(OrderLib.SmallOrder[] memory sellOrders, OrderLib.SmallOrder[] memory buyOrders, OrderLib.OrderCommon[] memory commons, OrderLib.Signature[] memory sellSigs, OrderLib.Signature[] memory buySigs) public {
    MatchingLib.matchOrders(state, sellOrders, buyOrders, commons, sellSigs, buySigs);
  }

  function cancel(OrderLib.Order memory order) public {
    MatchingLib.cancel(state, order);
  }

  function exercise(uint256 buyOrderSize, OrderLib.OrderCommon memory common) public payable {
    ExercisingLib.exercise(state, buyOrderSize, common);
  }

  function claim(OrderLib.OrderCommon memory common) public {
    ExercisingLib.claim(state, common);
  }

  function announce(OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, OrderLib.Signature memory sig) public {
    AnnounceLib.announce(state, order, common, sig);
  }

  function announceMany(OrderLib.SmallOrder[] memory orders, OrderLib.OrderCommon[] memory commons, OrderLib.Signature[] memory sigs) public {
    AnnounceLib.announceMany(state, orders, commons, sigs);
  }

  function tokenizePosition(uint256 size, OrderLib.OrderCommon memory common) public {
    TokenizeLib.tokenizePosition(state, size, common);
  }

  function unwrapPositionToken(address tokenAddress, uint256 size) public {
    TokenizeLib.unwrapPositionToken(state, tokenAddress, size);
  }

  function userOptionPosition(address user, bytes32 positionHash) public view returns (int) {
    return state.userOptionPosition[user][positionHash];
  }

  function userTokenBalances(address user, address token) public view returns (uint) {
    return state.userTokenBalances[user][token];
  }

  function userTokenLockedBalance(address user, address token) public view returns (uint) {
    return state.userTokenLockedBalance[user][token];
  }

  function positionPoolTokenBalance(bytes32 positionHash, address user) public view returns (uint) {
    return state.positionPoolTokenBalance[positionHash][user];
  }

  function positionTokenInfo(address tokenAddress) public view returns (AppStateLib.PositionToken memory token) {
    return state.positionTokenInfo[tokenAddress];
  }

  function positionTokenAddress(uint8 exposureType, bytes32 positionHash) public view returns (address info) {
    return state.positionTokenAddress[AppStateLib.ExposureType(exposureType)][positionHash];
  }
}
