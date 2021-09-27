pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import "./OrderLib.sol";

library AppStateLib {

  using OrderLib for OrderLib.OrderCommon;

  enum ExposureType {
    SHORT,
    LONG
  }

  struct PositionToken {
    ExposureType exposureType;
    address token;
    OrderLib.OrderCommon common;
  }

  struct AppState {
    // Order filling and matching
    mapping(address => mapping(bytes32 => uint)) userPairNonce;
    mapping(bytes32 => uint) orderPartialFill;

    // Funds
    mapping(address => mapping(address => uint)) userTokenBalances;
    mapping(address => mapping(address => uint)) userTokenLockedBalance;

    mapping(bytes32 => mapping(address => uint256)) positionPoolTokenBalance;
    mapping(bytes32 => uint256) positionPoolTokenTotalSupply;

    mapping(address => mapping(bytes32 => int)) userOptionPosition;


    // Tokenize Positions
    mapping(ExposureType => mapping(bytes32 => address)) groupCommonToken;
    mapping(address => PositionToken) positionTokenInfo;
  }
}
