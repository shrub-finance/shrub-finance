pragma solidity 0.7.0;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ShrubExchange {

  enum OptionType {
    PUT,
    CALL
  }

  // Data that is common between a buy and sell
  struct OrderCommon {
    address baseAsset;      // ETH-USD, USD is the base
    address quoteAsset;     // ETH-USD ETH is the quote
    uint expiry;            // timestamp expires
    uint strike;            // The price of the pair
    OptionType optionType;
  }

  struct Signature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }


  // Meant to be hashed with OrderCommon
  struct SmallOrder {
    uint size;
    bool isBuy;
    uint nonce;             // unique id of order
    uint price;
    uint offerExpire;       // time this order expires
    uint fee;               // matcherFee
  }

  struct Order {
    uint size;
    bool isBuy;
    uint nonce;             // unique id of order
    uint price;
    uint offerExpire;       // time this order expires
    uint fee;               // matcherFee

    address baseAsset;      // ETH-USD, USD is the base
    address quoteAsset;     // ETH-USD ETH is the quote
    uint expiry;            // timestamp expires
    uint strike;            // The price of the pair
    OptionType optionType;
  }

  event OrderMatched(address seller, address buyer, SmallOrder sellOrder, SmallOrder buyOrder, OrderCommon common);
  mapping(address => mapping(address => mapping(address => uint))) public userPairNonce;
  mapping(address => mapping(address => uint)) public userTokenBalances;
  mapping(address => mapping(address => uint)) public userTokenLockedBalance;
  mapping(address => mapping(bytes32 => int)) public userOptionPosition;

  bytes32 public constant SALT = keccak256("0x43efba454ccb1b6fff2625fe562bdd9a23260359");
  bytes public constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
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

  function hashOrder(Order memory order) public pure returns (bytes32) {
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


  function hashSmallOrder(SmallOrder memory order, OrderCommon memory common) public pure returns (bytes32) {
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

  function hashOrderCommon(OrderCommon memory common) public pure returns(bytes32) {
    return keccak256(abi.encodePacked(
      COMMON_TYPEHASH,
      common.baseAsset,
      common.quoteAsset,
      common.expiry,
      common.strike,
      common.optionType
    ));
  }

  function getCurrentNonce(address user, address quoteAsset, address baseAsset) public view returns(uint) {
    return userPairNonce[user][quoteAsset][baseAsset];
  }

  function getAvailableBalance(address user, address asset) public view returns(uint) {
    return userTokenBalances[user][asset] - userTokenLockedBalance[user][asset];
  }

  modifier orderMatches(SmallOrder memory sellOrder, SmallOrder memory buyOrder, OrderCommon memory common) {
    require(sellOrder.isBuy == false, "Sell order should not be buying");
    require(buyOrder.isBuy == true, "Buy order should be buying");

    require(sellOrder.price <= buyOrder.price, "Price must be sufficient for seller");
    require(sellOrder.size >= buyOrder.size, "Cannot buy more than being sold");
    require(sellOrder.offerExpire <= block.timestamp, "Sell order has expired");
    require(buyOrder.offerExpire <= block.timestamp, "Buy order has expired");

    _;
  }

  function matchOrder(SmallOrder memory sellOrder, SmallOrder memory buyOrder, OrderCommon memory common, Signature memory buySig, Signature memory sellSig) orderMatches(sellOrder, buyOrder, common) public {
    address seller = ecrecover(hashSmallOrder(sellOrder, common), sellSig.v, sellSig.r, sellSig.s);
    address buyer = ecrecover(hashSmallOrder(buyOrder, common), buySig.v, buySig.r, buySig.s);
    bytes32 positionHash = hashOrderCommon(common);
    require(getCurrentNonce(seller, common.quoteAsset, common.baseAsset) == sellOrder.nonce - 1);
    require(getCurrentNonce(buyer, common.quoteAsset, common.baseAsset) == buyOrder.nonce - 1);

    // TODO: Lockup capital
    if(common.optionType == OptionType.CALL) {
      require(getAvailableBalance(seller, common.quoteAsset) > sellOrder.size, "Seller must have enough free collateral");
      userTokenLockedBalance[seller][common.quoteAsset] += sellOrder.size;
    }
    if(common.optionType == OptionType.PUT) {
      require(getAvailableBalance(seller, common.baseAsset) > sellOrder.size * common.strike, "Seller must have enough free collateral");
      userTokenLockedBalance[seller][common.baseAsset] += sellOrder.size * common.strike;
    }

    userOptionPosition[seller][positionHash] -= int(sellOrder.size);
    userOptionPosition[buyer][positionHash] += int(sellOrder.size);

    emit OrderMatched(seller, buyer, sellOrder, buyOrder, common);
    userPairNonce[buyer][common.quoteAsset][common.baseAsset] = buyOrder.nonce;
    userPairNonce[seller][common.quoteAsset][common.baseAsset] = sellOrder.nonce;
  }

  function execute(SmallOrder memory buyOrder, OrderCommon memory common, address seller, Signature memory buySig) public payable {
    address buyer = ecrecover(hashSmallOrder(buyOrder, common), buySig.v, buySig.r, buySig.s);
    bytes32 positionHash = hashOrderCommon(common);
    require(userOptionPosition[buyer][positionHash] > 0, "Must have an open position to execute");
    require(userOptionPosition[seller][positionHash] < 0, "Seller must still be short for this position");
    require(common.expiry <= block.timestamp, "Option has already expired");

    if(common.optionType == OptionType.CALL) {
      // Reduce seller's locked capital and token balance of quote asset 
      userTokenBalances[seller][common.quoteAsset] -= buyOrder.size;
      userTokenLockedBalance[seller][common.quoteAsset] -= buyOrder.size * common.strike;
      // Give the seller the buyer's funds, in terms of baseAsset
      userTokenBalances[seller][common.baseAsset] += buyOrder.size * common.strike;

      userTokenBalances[buyer][common.baseAsset] -= buyOrder.size * common.strike;
      userTokenBalances[buyer][common.quoteAsset] += buyOrder.size;
    }
    if(common.optionType == OptionType.PUT) {
      // Reduce seller's locked capital and token balance of base asset 
      userTokenBalances[seller][common.baseAsset] -= buyOrder.size * common.strike;
      userTokenLockedBalance[seller][common.baseAsset] -= buyOrder.size * common.strike;
      // Give the seller the buyer's funds, in terms of quoteAsset
      userTokenBalances[seller][common.quoteAsset] += buyOrder.size;

      userTokenBalances[buyer][common.baseAsset] += buyOrder.size * common.strike;
      userTokenBalances[buyer][common.quoteAsset] -= buyOrder.size;
    }
  }
}
