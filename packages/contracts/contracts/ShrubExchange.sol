pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

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
    uint size;              // number of contracts in terms of the smallest unit of the quoteAsset (i.e. 1e18 for 1 ETH call contract)
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

    address baseAsset;      // ETH-USD, USD is the base
    address quoteAsset;     // ETH-USD ETH is the quote
    uint expiry;            // timestamp expires
    uint strike;            // The price of the pair in terms of the exercise price in the baseAsset times 1e6 (i.e. 2000e6 for a 2000 USDC strike price)
    OptionType optionType;
  }

  event Deposit(address user, address token, uint amount);
  event Withdraw(address user, address token, uint amount);
  event OrderAnnounce(OrderCommon indexed common, bytes32 indexed positionHash, SmallOrder order, Signature sig);
  event OrderMatched(address indexed seller, address indexed buyer, bytes32 positionHash, SmallOrder sellOrder, SmallOrder buyOrder, OrderCommon common);
  mapping(address => mapping(address => mapping(address => uint))) public userPairNonce;
  mapping(address => mapping(address => uint)) public userTokenBalances;
  mapping(address => mapping(address => uint)) public userTokenLockedBalance;
  mapping(address => mapping(bytes32 => int)) public userOptionPosition;

  address private constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

  // Used to shift price and strike up and down by factors of 1 million
  uint private constant BASE_SHIFT = 1000000;

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

  function getSignedHash(bytes32 hash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
  }

  function validateSignature(address user, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure returns(bool) {
    bytes32 payloadHash = getSignedHash(hash);
    return ecrecover(payloadHash, v, r, s) == user;
  }

  function checkOrderMatches(SmallOrder memory sellOrder, SmallOrder memory buyOrder) internal view returns (bool) {
    bool matches = true;
    matches = matches && sellOrder.isBuy == false;
    matches = matches && buyOrder.isBuy == true;

    matches = matches && sellOrder.price <= buyOrder.price;
    matches = matches && sellOrder.offerExpire >= block.timestamp;
    matches = matches && buyOrder.offerExpire >= block.timestamp;
    return matches;
  }

  modifier orderMatches(SmallOrder memory sellOrder, SmallOrder memory buyOrder, OrderCommon memory common) {
    require(sellOrder.isBuy == false, "Sell order should not be buying");
    require(buyOrder.isBuy == true, "Buy order should be buying");

    require(sellOrder.price <= buyOrder.price, "Price must be sufficient for seller");
    require(sellOrder.offerExpire >= block.timestamp, "Sell order has expired");
    require(buyOrder.offerExpire >= block.timestamp, "Buy order has expired");

    _;
  }

  function getAddressFromSignedOrder(SmallOrder memory order, OrderCommon memory common, Signature memory sig) public pure returns(address) {
    //console.log('sig: v, r, s');
    //console.log(sig.v);
    //console.logBytes32(sig.r);
    //console.logBytes32(sig.s);
    //console.log('order: size, isBuy, nonce, price, offerExpire, fee');
    //console.log(order.size);
    //console.log(order.isBuy);
    //console.log(order.nonce);
    //console.log(order.price);
    //console.log(order.offerExpire);
    //console.log(order.fee);
    //console.log('common: baseAsset, quoteAsset, expiry, strike');
    //console.log(common.baseAsset);
    //console.log(common.quoteAsset);
    //console.log(common.expiry);
    //console.log(common.strike);
    //console.log('hashSmallOrder, getSignedHash, ecrecover');
    //console.logBytes32(hashSmallOrder(order, common));
    //console.logBytes32(getSignedHash(hashSmallOrder(order, common)));
    //console.log(ecrecover(getSignedHash(hashSmallOrder(order, common)), sig.v, sig.r, sig.s));
    address recovered = ecrecover(getSignedHash(hashSmallOrder(order, common)), sig.v, sig.r, sig.s);
    require(recovered != ZERO_ADDRESS, "Invalid signature, recovered ZERO_ADDRESS");
    return recovered;
  }

  function deposit(address token, uint amount) public payable {
    if(token != ZERO_ADDRESS) {
      require(ERC20(token).transferFrom(msg.sender, address(this), amount), "Must succeed in taking tokens");
      userTokenBalances[msg.sender][token] += amount;
    }
    if(msg.value > 0) {
      userTokenBalances[msg.sender][token] += msg.value;
    }
    emit Deposit(msg.sender, token, amount);
  }

  function depositAndMatch(address token, uint amount, SmallOrder memory sellOrder, SmallOrder memory buyOrder, OrderCommon memory common, Signature memory sellSig, Signature memory buySig) public payable {
    deposit(token, amount);
    matchOrder(sellOrder, buyOrder, common, sellSig, buySig);
  }

  function depositAndAnnounce(address token, uint amount, SmallOrder memory order, OrderCommon memory common, Signature memory sig) public payable {
    deposit(token, amount);
    announce(order, common, sig);
  }


  function depositAndMatchMany(address token, uint amount, SmallOrder[] memory sellOrders, SmallOrder[] memory buyOrders, OrderCommon[] memory commons, Signature[] memory sellSigs, Signature[] memory buySigs) public payable {
    deposit(token, amount);
    matchOrders(sellOrders, buyOrders, commons, sellSigs, buySigs);
  }

  function withdraw(address token, uint amount) public {
    uint balance = getAvailableBalance(msg.sender, token);
    require(amount <= balance, "Cannot withdraw more than available balance");
    userTokenBalances[msg.sender][token] -= amount;
    if(token == ZERO_ADDRESS) {
      payable(msg.sender).transfer(amount);
    } else {
      require(ERC20(token).transfer(msg.sender, amount), "ERC20 transfer must succeed");
    }
    emit Withdraw(msg.sender, token, amount);
  }

  function matchOrder(SmallOrder memory sellOrder, SmallOrder memory buyOrder, OrderCommon memory common, Signature memory sellSig, Signature memory buySig) public {
    (address buyer, address seller, bytes32 positionHash) = doPartialMatch(sellOrder, buyOrder, common, sellSig, buySig);
    emit OrderMatched(seller, buyer, positionHash, sellOrder, buyOrder, common);
    userPairNonce[buyer][common.quoteAsset][common.baseAsset] = buyOrder.nonce;
    userPairNonce[seller][common.quoteAsset][common.baseAsset] = sellOrder.nonce;
  }


  function adjustWithRatio(uint number, uint partsPerMillion) internal pure returns (uint) {
    return (number * partsPerMillion) / BASE_SHIFT;
  }


  function getAdjustedPriceAndFillSize(SmallOrder memory sellOrder, SmallOrder memory buyOrder) internal pure returns (uint, uint) {
    uint fillSize = sellOrder.size < buyOrder.size ?  sellOrder.size : buyOrder.size;
    uint adjustedPrice = fillSize * sellOrder.price / sellOrder.size;

    return (fillSize, adjustedPrice);
  }

  function doPartialMatch(SmallOrder memory sellOrder, SmallOrder memory buyOrder, OrderCommon memory common, Signature memory sellSig, Signature memory buySig)
  internal returns(address, address, bytes32) {
    require(checkOrderMatches(sellOrder, buyOrder), "Buy and sell order do not match");
    address seller = getAddressFromSignedOrder(sellOrder, common, sellSig);
    address buyer = getAddressFromSignedOrder(buyOrder, common, buySig);
    require(seller != buyer, "Seller and Buyer must be different");
    bytes32 positionHash = hashOrderCommon(common);

    require(getCurrentNonce(seller, common.quoteAsset, common.baseAsset) == sellOrder.nonce - 1, "Seller nonce incorrect");
    require(getCurrentNonce(buyer, common.quoteAsset, common.baseAsset) == buyOrder.nonce - 1, "Buyer nonce incorrect");

    (uint fillSize, uint adjustedPrice) = getAdjustedPriceAndFillSize(sellOrder, buyOrder);

    if(common.optionType == OptionType.CALL) {
      require(getAvailableBalance(seller, common.quoteAsset) >= fillSize, "Call Seller must have enough free collateral");
      require(getAvailableBalance(buyer, common.baseAsset) >= adjustedPrice, "Call Buyer must have enough free collateral");
      userTokenLockedBalance[seller][common.quoteAsset] += fillSize;
      userTokenBalances[seller][common.baseAsset] += adjustedPrice;
      userTokenBalances[buyer][common.baseAsset] -= adjustedPrice;
    }

    if(common.optionType == OptionType.PUT) {
      require(getAvailableBalance(seller, common.baseAsset) >= adjustWithRatio(fillSize, common.strike), "Put Seller must have enough free collateral");
      require(getAvailableBalance(buyer, common.quoteAsset) >= adjustedPrice, "Put Buyer must have enough free collateral");
      userTokenLockedBalance[seller][common.baseAsset] += adjustWithRatio(fillSize, common.strike);
      userTokenBalances[seller][common.quoteAsset] += adjustedPrice;
      userTokenBalances[buyer][common.quoteAsset] -= adjustedPrice;
    }

    userOptionPosition[seller][positionHash] -= int(fillSize);
    userOptionPosition[buyer][positionHash] += int(fillSize);

    return (buyer, seller, positionHash);
  }

  function matchOrders(SmallOrder[] memory sellOrders, SmallOrder[] memory buyOrders, OrderCommon[] memory commons, Signature[] memory sellSigs, Signature[] memory buySigs) public {
    uint sellIndex = 0;
    uint buyIndex = 0;
    uint sellFilled = 0;
    uint buyFilled = 0;
    uint sellsLen = sellOrders.length;
    uint buysLen = buyOrders.length;
    while(sellIndex < sellOrders.length && buyIndex < buysLen) {
      SmallOrder memory sellOrder = sellOrders[sellIndex];
      OrderCommon memory common = commons[sellIndex];
      Signature memory sellSig = sellSigs[sellIndex];
      SmallOrder memory buyOrder = buyOrders[buyIndex];
      Signature memory buySig = buySigs[buyIndex];
      (address buyer, address seller, bytes32 positionHash) = doPartialMatch(sellOrder, buyOrder, common, sellSig, buySig);

      if(sellOrder.size - sellFilled >= buyOrder.size - buyFilled) {
        sellFilled += buyOrder.size;
        buyIndex++;
        if(sellFilled == sellOrder.size || buyIndex == buysLen) {
          sellIndex++;
          userPairNonce[seller][common.quoteAsset][common.baseAsset] = sellOrder.nonce;
          // calculate remainder of selling order and add it to internal offers
          sellFilled = 0;
        }
        emit OrderMatched(seller, buyer, positionHash, sellOrder, buyOrder, common);
        userPairNonce[buyer][common.quoteAsset][common.baseAsset] = buyOrder.nonce;
      } else if (sellOrder.size - sellFilled < buyOrder.size - buyFilled) {
        buyFilled += sellOrder.size;
        sellIndex++;
        if(buyFilled == buyOrder.size || sellIndex == sellsLen) {
          buyIndex++;
          userPairNonce[buyer][common.quoteAsset][common.baseAsset] = buyOrder.nonce;
          // calculate remainder of buying order and add it to internal offers
          buyFilled = 0;
        }
        emit OrderMatched(seller, buyer, positionHash, sellOrder, buyOrder, common);
        userPairNonce[seller][common.quoteAsset][common.baseAsset] = sellOrder.nonce;
      }
    }
  }

  function execute(SmallOrder memory buyOrder, OrderCommon memory common, address seller, Signature memory buySig) public payable {
    address buyer = getAddressFromSignedOrder(buyOrder, common, buySig);
    //    console.log(buyer);
    //    console.log(seller);
    bytes32 positionHash = hashOrderCommon(common);
    //    console.logBytes32(positionHash);
    //    console.logInt(userOptionPosition[buyer][positionHash]);
    //    console.logInt(userOptionPosition[seller][positionHash]);
    require(userOptionPosition[buyer][positionHash] > 0, "Must have an open position to execute");
    require(userOptionPosition[seller][positionHash] < 0, "Seller must still be short for this position");
    require(common.expiry >= block.timestamp, "Option has already expired");

    if(common.optionType == OptionType.CALL) {
      // unlock the assets for seller
      userTokenLockedBalance[seller][common.quoteAsset] -= buyOrder.size;

      // Reduce seller's locked capital and token balance of quote asset
      userTokenBalances[seller][common.quoteAsset] -= buyOrder.size;
      userTokenBalances[buyer][common.quoteAsset] += buyOrder.size;

      // Give the seller the buyer's funds, in terms of baseAsset
      userTokenBalances[seller][common.baseAsset] += adjustWithRatio(buyOrder.size, common.strike);
      userTokenBalances[buyer][common.baseAsset] -= adjustWithRatio(buyOrder.size, common.strike);
    }
    if(common.optionType == OptionType.PUT) {
      // unlock the assets of the seller
      userTokenLockedBalance[seller][common.baseAsset] -= adjustWithRatio(buyOrder.size, common.strike);

      // Reduce seller's locked capital and token balance of base asset
      userTokenBalances[seller][common.baseAsset] -= adjustWithRatio(buyOrder.size, common.strike);
      userTokenBalances[buyer][common.baseAsset] += adjustWithRatio(buyOrder.size, common.strike);

      // Give the seller the buyer's funds, in terms of quoteAsset
      userTokenBalances[seller][common.quoteAsset] += buyOrder.size;
      userTokenBalances[buyer][common.quoteAsset] -= buyOrder.size;
    }
  }

  function announce(SmallOrder memory order, OrderCommon memory common, Signature memory sig) public {
    bytes32 positionHash = hashOrderCommon(common);
    address user = getAddressFromSignedOrder(order, common, sig);
    require(getCurrentNonce(user, common.quoteAsset, common.baseAsset) == order.nonce - 1, "User nonce incorrect");

    if(common.optionType == OptionType.CALL) {
      if(order.isBuy) {
        require(getAvailableBalance(user, common.baseAsset) >= order.price, "Call Buyer must have enough free collateral");
      } else {
        require(getAvailableBalance(user, common.quoteAsset) >= order.size, "Call Seller must have enough free collateral");
      }
    }

    if(common.optionType == OptionType.PUT) {
      if(order.isBuy) {
        require(getAvailableBalance(user, common.quoteAsset) >= order.price, "Put Buyer must have enough free collateral");
      } else {
        require(getAvailableBalance(user, common.baseAsset) >= adjustWithRatio(order.size, common.strike), "Put Seller must have enough free collateral");
      }
    }

    emit OrderAnnounce(common, positionHash, order, sig);
  }


  function announceMany(SmallOrder[] memory orders, OrderCommon[] memory commons, Signature[] memory sigs) public {
    require(orders.length == commons.length, "Array length mismatch");
    require(orders.length == sigs.length, "Array length mismatch");
    for(uint i = 0; i < orders.length; i++) {
      announce(orders[i], commons[i], sigs[i]);
    }
  }
}
