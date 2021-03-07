pragma solidity 0.7.6;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OptionsExchange {

  enum OptionType {
    PUT,
    CALL
  }

  struct Order {
    uint size;
    address signer;
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

    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  mapping(address => mapping(address => mapping(address => uint))) userPairNonce;
  mapping(address => mapping(address => uint)) userTokenBalances;
  mapping(address => mapping(address => uint)) userTokenLockedBalance;

  bytes32 private constant SALT = 0x43efba454ccb1b6fff2625fe562bdd9a23260359;
  string private constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
  bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(EIP712_DOMAIN);
  bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
    EIP712_DOMAIN_TYPEHASH,
    keccak256("Shrub Trade"),
    keccak256("1"),
    1,
    address(this),
    SALT
  ));

  function hashOrder(Order order) public pure returns (bytes32) {
    return keccak256(abi.encode(
      IDENTITY_TYPEHASH,
      order.size,
      order.signer,
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

      order.v,
      order.r,
      order.s,
    ));
  }

  function verifySignature(Order order) public returns(bool) {

  }

  modifier orderMatches(Order sellOrder, Order buyOrder) {
    require(sellOrder.isBuy == false, "Sell order should not be buying");
    require(buyOrder.isBuy == true, "Buy order should be buying");
    require(sellOrder.baseAsset == buyOrder.baseAsset, "Base Must Match");
    require(sellOrder.quoteAsset == buyOrder.quoteAsset, "Quote Must Match");
    require(sellOrder.expiry == buyOrder.expiry, "Expiration must match");
    require(sellOrder.strike == buyOrder.strike, "Strike price must match");
    require(sellOrder.price <= buyOrder.price, "Price must be sufficient for seller");
    require(sellOrder.optionType == buyOrder.optionType, "Must be the same option type");

    require(sellOrder.size >= buyOrder.size, "Cannot buy more than being sold");
    require(sellOrder.offerExpire <= block.time, "Sell order has expired");
    require(buyOrder.offerExpire <= block.time, "Buy order has expired");

    require(verifySignature(sellOrder), "Seller signature must match");
    require(verifySignature(buyOrder), "Buyer signature must match");
    _;
  }

  function matchOrder(Order sellOrder, Order buyOrder) orderMatches(sellOrder, buyOrder) public {
    userTokenLockedBalance[sellOrder.baseAsset] += sellOrder.size * sellOrder.price;
    ERC20(sellOrder.baseAsset);
  }
}
