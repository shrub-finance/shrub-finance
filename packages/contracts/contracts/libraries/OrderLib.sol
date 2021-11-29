pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

library OrderLib {

  address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
  bytes32 public constant SALT = keccak256("0x43efba454ccb1b6fff2625fe562bdd9a23260359");
  bytes public constant EIP712_DOMAIN = "EIP712Domain(string name, string version, uint256 chainId, address verifyingContract, bytes32 salt)";
  bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256(EIP712_DOMAIN);
  bytes32 public constant DOMAIN_SEPARATOR = keccak256(abi.encode(
    EIP712_DOMAIN_TYPEHASH,
    keccak256("Shrub Trade"),
    keccak256("1"),
    1,
    0x6e80C53f2cdCad7843aD765E4918298427AaC550,
    SALT
  ));

  bytes32 public constant ORDER_TYPEHASH = keccak256("Order(uint size, address signer, bool isBuy, uint nonce, uint price, uint offerExpire, uint fee, address baseAsset, address quoteAsset, uint expiry, uint strike, OptionType optionType)");

  bytes32 public constant COMMON_TYPEHASH = keccak256("OrderCommon(address baseAsset, address quoteAsset, uint expiry, uint strike, OptionType optionType)");


  struct Signature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }


  enum OptionType {
    PUT,
    CALL
  }

  // Data that is common between a buy and sell
  struct OrderCommon {
    address baseAsset;      // MATIC-USD, USD is the base
    address quoteAsset;     // MATIC-USD MATIC is the quote
    uint expiry;            // timestamp expires
    uint strike;            // The price of the pair
    uint8 optionType;
  }

  // Meant to be hashed with OrderCommon
  struct SmallOrder {
    uint size;              // number of contracts in terms of the smallest unit of the quoteAsset (i.e. 1e18 for 1 MATIC call contract)
    bool isBuy;
    uint nonce;             // unique id of order
    uint price;             // total price of the order in terms of the smallest unit of the baseAsset (i.e. 200e6 for an order costing a total of 200 USDC) (price goes up with size)
    uint offerExpire;       // time this order expires
    uint fee;               // matcherFee in terms of wei
  }

  struct Order {
    uint size;
    bool isBuy;
    uint nonce;             // unique id of order
    uint price;
    uint offerExpire;       // time this order expires
    uint fee;               // matcherFee

    address baseAsset;      // MATIC-USD, USD is the base
    address quoteAsset;     // MATIC-USD MATIC is the quote
    uint expiry;            // timestamp expires
    uint strike;            // The price of the pair in terms of the exercise price in the baseAsset times 1e6 (i.e. 2000e6 for a 2000 USDC strike price)
    uint8 optionType;
  }

  function getCommonFromOrder(Order memory order) internal pure returns (OrderCommon memory common) {
    return OrderCommon({
      baseAsset: order.baseAsset,
      quoteAsset: order.quoteAsset,
      expiry: order.expiry,
      strike: order.strike,
      optionType: order.optionType
    });
  }

  function hashOrder(Order memory order) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(
      ORDER_TYPEHASH,
      order.size,
      order.isBuy,
      order.nonce,
      order.price,
      order.offerExpire,
      order.fee,

      order.baseAsset,
      order.quoteAsset,
      order.expiry,
      order.strike,
      order.optionType
    ));
  }

  function hashSmallOrder(SmallOrder memory order, OrderCommon memory common) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(
      ORDER_TYPEHASH,
      order.size,
      order.isBuy,
      order.nonce,
      order.price,
      order.offerExpire,
      order.fee,

      common.baseAsset,
      common.quoteAsset,
      common.expiry,
      common.strike,
      common.optionType
    ));
  }

  function hashOrderCommon(OrderCommon memory common) internal pure returns(bytes32) {
    return keccak256(abi.encodePacked(
      COMMON_TYPEHASH,
      common.baseAsset,
      common.quoteAsset,
      common.expiry,
      common.strike,
      common.optionType
    ));
  }

  function getSignedHash(bytes32 hash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
  }

  function validateSignature(address user, bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns(bool) {
    bytes32 payloadHash = getSignedHash(hash);
    return ecrecover(payloadHash, v, r, s) == user;
  }

  function checkOrderMatches(SmallOrder memory sellOrder, SmallOrder memory buyOrder) internal view returns (bool) {
    console.log('checkOrderMatches');
    bool matches = true;
    matches = matches && sellOrder.isBuy == false;
    matches = matches && buyOrder.isBuy == true;

    matches = matches && sellOrder.offerExpire >= block.timestamp;
    matches = matches && buyOrder.offerExpire >= block.timestamp;
    return matches;
  }

  function getAddressFromSignedOrder(SmallOrder memory order, OrderCommon memory common, Signature memory sig) internal pure returns(address) {
    return getAddressFromOrderHash(hashSmallOrder(order, common), sig);
  }

  function getAddressFromOrderHash(bytes32 orderHash, Signature memory sig) internal pure returns(address) {
    address recovered = ecrecover(getSignedHash(orderHash), sig.v, sig.r, sig.s);
    require(recovered != ZERO_ADDRESS, "Invalid signature, recovered ZERO_ADDRESS");
    return recovered;
  }
}
