pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./OrderLib.sol";

contract ShrubExchange {

  using OrderLib for OrderLib.OrderCommon;
  using OrderLib for OrderLib.SmallOrder;
  using OrderLib for OrderLib.Order;
  using OrderLib for OrderLib.OptionType;

  event Deposit(address user, address token, uint amount);
  event Withdraw(address user, address token, uint amount);
  event OrderAnnounce(OrderLib.OrderCommon common, bytes32 indexed positionHash, address indexed user, OrderLib.SmallOrder order, OrderLib.Signature sig);
  event OrderMatched(address indexed seller, address indexed buyer, bytes32 positionHash, OrderLib.SmallOrder sellOrder, OrderLib.SmallOrder buyOrder, OrderLib.OrderCommon common);


  bytes32 public ORDER_TYPEHASH = OrderLib.ORDER_TYPEHASH;
  mapping(address => mapping(bytes32 => uint)) public userPairNonce;
  mapping(address => mapping(address => uint)) public userTokenBalances;
  mapping(address => mapping(address => uint)) public userTokenLockedBalance;
  mapping(bytes32 => uint) public orderPartialFill;

  mapping(bytes32 => mapping(address => uint256)) public positionPoolTokenBalance;
  mapping(bytes32 => uint256) public positionPoolTokenTotalSupply;

  mapping(address => mapping(bytes32 => int)) public userOptionPosition;


  // Used to shift price and strike up and down by factors of 1 million
  uint private constant BASE_SHIFT = 1000000;

  function min(uint256 a, uint256 b) pure private returns (uint256) {
    return a < b ? a : b;
  }

  function getCurrentNonce(address user, OrderLib.OrderCommon memory common) public view returns(uint) {
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    return userPairNonce[user][positionHash];
  }

  function getCurrentNonce(address user, bytes32 commonHash) public view returns(uint) {
    return userPairNonce[user][commonHash];
  }

  function getAvailableBalance(address user, address asset) public view returns(uint) {
    return userTokenBalances[user][asset] - userTokenLockedBalance[user][asset];
  }

  function deposit(address token, uint amount) public payable {
    if(token != OrderLib.ZERO_ADDRESS) {
      require(ERC20(token).transferFrom(msg.sender, address(this), amount), "Must succeed in taking tokens");
      userTokenBalances[msg.sender][token] += amount;
    }
    if(msg.value > 0) {
      userTokenBalances[msg.sender][token] += msg.value;
    }
    emit Deposit(msg.sender, token, amount);
  }

  function depositAndMatch(address token, uint amount, OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder, OrderLib.OrderCommon memory common, OrderLib.Signature memory sellSig, OrderLib.Signature memory buySig) public payable {
    deposit(token, amount);
    matchOrder(sellOrder, buyOrder, common, sellSig, buySig);
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
    uint balance = getAvailableBalance(msg.sender, token);
    require(amount <= balance, "Cannot withdraw more than available balance");
    userTokenBalances[msg.sender][token] -= amount;
    if(token == OrderLib.ZERO_ADDRESS) {
      payable(msg.sender).transfer(amount);
    } else {
      require(ERC20(token).transfer(msg.sender, amount), "ERC20 transfer must succeed");
    }
    emit Withdraw(msg.sender, token, amount);
  }

  function matchOrder(OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder, OrderLib.OrderCommon memory common, OrderLib.Signature memory sellSig, OrderLib.Signature memory buySig) public {
    (address buyer, address seller, bytes32 positionHash) = doPartialMatch(sellOrder, buyOrder, common, sellSig, buySig);
    emit OrderMatched(seller, buyer, positionHash, sellOrder, buyOrder, common);

    if(sellOrder.size > buyOrder.size) {
      partialFill(sellOrder, common, buyOrder.size);
    }

    if(sellOrder.size < buyOrder.size) {
      partialFill(buyOrder, common, sellOrder.size);
    }

    userPairNonce[buyer][positionHash] = buyOrder.nonce;
    userPairNonce[seller][positionHash] = sellOrder.nonce;
  }


  function adjustWithRatio(uint number, uint partsPerMillion) internal pure returns (uint) {
    return (number * partsPerMillion) / BASE_SHIFT;
  }


  function getOrderSize(OrderLib.SmallOrder memory order, bytes32 orderHash) internal view returns (uint) {
    if(orderPartialFill[orderHash] == 0) {
      return order.size;
    } else {
      return orderPartialFill[orderHash];
    }
  }

  function getAdjustedPriceAndFillSize(OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder) internal pure returns (uint, uint) {
    uint fillSize = min(sellOrder.size, buyOrder.size);
    uint adjustedPrice = fillSize * sellOrder.price / sellOrder.size;

    uint buyerAdjustedPrice = fillSize * buyOrder.price / buyOrder.size;
    require(adjustedPrice <= buyerAdjustedPrice, "Seller order price does not satisfy Buyer order price");

    return (fillSize, adjustedPrice);
  }

  function checkValidNonce(address user, bytes32 positionHash, OrderLib.SmallOrder memory order, bytes32 orderHash) internal view returns(bool) {
    if(getCurrentNonce(user, positionHash) == order.nonce - 1) {
      return true;
    } else {
      return orderPartialFill[orderHash] > 0;
    }
  }



  function fillCallOption(address buyer, address seller, OrderLib.OrderCommon memory common, uint fillSize, uint adjustedPrice, bytes32 positionHash) internal {
    require(getAvailableBalance(seller, common.quoteAsset) >= fillSize, "Call Seller must have enough free collateral");
    require(getAvailableBalance(buyer, common.baseAsset) >= adjustedPrice, "Call Buyer must have enough free collateral");

    userTokenLockedBalance[seller][common.quoteAsset] += fillSize;
    positionPoolTokenBalance[positionHash][common.quoteAsset] += fillSize;
    positionPoolTokenTotalSupply[positionHash] += fillSize;

    userTokenBalances[seller][common.baseAsset] += adjustedPrice;
    userTokenBalances[buyer][common.baseAsset] -= adjustedPrice;


    // unlock buyer's collateral if this user was short
    if(userOptionPosition[buyer][positionHash] < 0 && userTokenLockedBalance[buyer][common.quoteAsset] > 0) {
      userTokenLockedBalance[buyer][common.quoteAsset] -= min(fillSize, userTokenLockedBalance[buyer][common.quoteAsset]);
    }
  }

  function fillPutOption(address buyer, address seller, OrderLib.OrderCommon memory common, uint fillSize, uint adjustedPrice, bytes32 positionHash) internal {
    uint lockedCapital = adjustWithRatio(fillSize, common.strike);

    require(getAvailableBalance(seller, common.baseAsset) >= lockedCapital, "Put Seller must have enough free collateral");
    require(getAvailableBalance(buyer, common.quoteAsset) >= adjustedPrice, "Put Buyer must have enough free collateral");

    userTokenLockedBalance[seller][common.baseAsset] += lockedCapital;
    positionPoolTokenBalance[positionHash][common.baseAsset] += lockedCapital;
    positionPoolTokenTotalSupply[positionHash] += lockedCapital;

    userTokenBalances[seller][common.quoteAsset] += adjustedPrice;
    userTokenBalances[buyer][common.quoteAsset] -= adjustedPrice;

    // unlock buyer's collateral if this user was short
    if(userOptionPosition[buyer][positionHash] < 0 && userTokenLockedBalance[buyer][common.baseAsset] > 0) {
      userTokenLockedBalance[buyer][common.baseAsset] -= min(lockedCapital, userTokenLockedBalance[buyer][common.baseAsset]);
    }
  }

  function doPartialMatch(OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder, OrderLib.OrderCommon memory common, OrderLib.Signature memory sellSig, OrderLib.Signature memory buySig)
  internal returns(address, address, bytes32) {
    require(OrderLib.checkOrderMatches(sellOrder, buyOrder), "Buy and sell order do not match");
    bytes32 sellOrderHash = OrderLib.hashSmallOrder(sellOrder, common);
    bytes32 buyOrderHash = OrderLib.hashSmallOrder(buyOrder, common);

    address seller = OrderLib.getAddressFromOrderHash(sellOrderHash, sellSig);
    address buyer = OrderLib.getAddressFromOrderHash(buyOrderHash, buySig);
    require(seller != buyer, "Seller and Buyer must be different");
    bytes32 positionHash = OrderLib.hashOrderCommon(common);

    require(checkValidNonce(seller, positionHash, sellOrder, sellOrderHash), "Seller nonce incorrect");
    require(checkValidNonce(buyer, positionHash, buyOrder, buyOrderHash), "Buyer nonce incorrect");

    sellOrder.size = getOrderSize(sellOrder, sellOrderHash);
    buyOrder.size = getOrderSize(buyOrder, buyOrderHash);

    (uint fillSize, uint adjustedPrice) = getAdjustedPriceAndFillSize(sellOrder, buyOrder);

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      fillCallOption(buyer, seller, common, fillSize, adjustedPrice, positionHash);
    }

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      fillPutOption(buyer, seller, common, fillSize, adjustedPrice, positionHash);
    }

    userOptionPosition[seller][positionHash] -= int(fillSize);
    userOptionPosition[buyer][positionHash] += int(fillSize);

    return (buyer, seller, positionHash);
  }

  function partialFill(OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, uint filledSize) internal {
    if(order.size - filledSize > 0) {
      orderPartialFill[OrderLib.hashSmallOrder(order, common)] = order.size - filledSize;
    }
  }

  function matchOrders(OrderLib.SmallOrder[] memory sellOrders, OrderLib.SmallOrder[] memory buyOrders, OrderLib.OrderCommon[] memory commons, OrderLib.Signature[] memory sellSigs, OrderLib.Signature[] memory buySigs) public {
    uint sellIndex = 0;
    uint buyIndex = 0;
    uint sellFilled = 0;
    uint buyFilled = 0;
    uint sellsLen = sellOrders.length;
    uint buysLen = buyOrders.length;
    while(sellIndex < sellOrders.length && buyIndex < buysLen) {
      OrderLib.SmallOrder memory sellOrder = sellOrders[sellIndex];
      OrderLib.OrderCommon memory common = commons[sellIndex];
      OrderLib.Signature memory sellSig = sellSigs[sellIndex];
      OrderLib.SmallOrder memory buyOrder = buyOrders[buyIndex];
      OrderLib.Signature memory buySig = buySigs[buyIndex];
      (address buyer, address seller, bytes32 positionHash) = doPartialMatch(sellOrder, buyOrder, common, sellSig, buySig);

      if(sellOrder.size - sellFilled >= buyOrder.size - buyFilled) {
        sellFilled += buyOrder.size;
        buyIndex++;
        if(sellFilled == sellOrder.size || buyIndex == buysLen) {
          sellIndex++;
          userPairNonce[seller][positionHash] = sellOrder.nonce;
          partialFill(sellOrder, common, sellFilled);
          sellFilled = 0;
        }
        emit OrderMatched(seller, buyer, positionHash, sellOrder, buyOrder, common);
        userPairNonce[buyer][positionHash] = buyOrder.nonce;
      } else if (sellOrder.size - sellFilled < buyOrder.size - buyFilled) {
        buyFilled += sellOrder.size;
        sellIndex++;
        if(buyFilled == buyOrder.size || sellIndex == sellsLen) {
          buyIndex++;
          userPairNonce[buyer][positionHash] = buyOrder.nonce;
          partialFill(buyOrder, common, buyFilled);
          buyFilled = 0;
        }
        emit OrderMatched(seller, buyer, positionHash, sellOrder, buyOrder, common);
        userPairNonce[seller][positionHash] = sellOrder.nonce;
      }
    }
  }

  function cancel(OrderLib.Order memory order) public {
    OrderLib.OrderCommon memory common = OrderLib.getCommonFromOrder(order);
    bytes32 commonHash = OrderLib.hashOrderCommon(common);
    bytes32 orderHash = OrderLib.hashOrder(order);
    if(orderPartialFill[orderHash] > 0) {
      orderPartialFill[orderHash] = 0;
    } else {
      require(order.nonce - 1 >= getCurrentNonce(msg.sender, commonHash), "Invalid order nonce");
      userPairNonce[msg.sender][commonHash] = order.nonce;
    }
  }

  function exercise(uint256 buyOrderSize, OrderLib.OrderCommon memory common) public payable {
    address buyer = msg.sender;
    bytes32 positionHash = OrderLib.hashOrderCommon(common);

    require(userOptionPosition[buyer][positionHash] > 0, "Must have an open position to exercise");
    require(userOptionPosition[buyer][positionHash] >= int(buyOrderSize), "Cannot exercise more than owned");
    require(int(buyOrderSize) > 0, "buyOrderSize is too large");
    require(common.expiry >= block.timestamp, "Option has already expired");

    // user has exercised this many
    userOptionPosition[buyer][positionHash] -= int(buyOrderSize);

    uint256 totalPaid = adjustWithRatio(buyOrderSize, common.strike);

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      require(positionPoolTokenBalance[positionHash][common.quoteAsset] >= buyOrderSize, "Pool must have enough funds");
      require(userTokenBalances[buyer][common.baseAsset] >= totalPaid, "Buyer must have enough funds to exercise CALL");

      // deduct the quoteAsset from the pool
      positionPoolTokenBalance[positionHash][common.quoteAsset] -= buyOrderSize;

      // Reduce seller's locked capital and token balance of quote asset
      userTokenBalances[buyer][common.quoteAsset] += buyOrderSize;

      // Give the seller the buyer's funds, in terms of baseAsset
      positionPoolTokenBalance[positionHash][common.baseAsset] += totalPaid;

      // deduct strike * size from buyer
      userTokenBalances[buyer][common.baseAsset] -= totalPaid;
    }
    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      require(positionPoolTokenBalance[positionHash][common.baseAsset] >= totalPaid, "Pool must have enough funds");
      require(userTokenBalances[buyer][common.quoteAsset] >= buyOrderSize, "Buyer must have enough funds to exercise PUT");

      // deduct baseAsset from pool
      positionPoolTokenBalance[positionHash][common.baseAsset] -= totalPaid;

      // increase exercisee balance by strike * size
      userTokenBalances[buyer][common.baseAsset] += totalPaid;

      // credit the pool the amount of quote asset sold
      positionPoolTokenBalance[positionHash][common.quoteAsset] += buyOrderSize;

      // deduct balance of tokens sold
      userTokenBalances[buyer][common.quoteAsset] -= buyOrderSize;
    }
  }

  function claim(OrderLib.OrderCommon memory common) public {
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    require(userOptionPosition[msg.sender][positionHash] < 0, "Must have sold an option to claim");
    require(common.expiry < block.timestamp, "Cannot claim until options are expired");

    uint256 poolOwnership =  uint256(-1 * userOptionPosition[msg.sender][positionHash]);

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      // reset quoteAsset locked balance
      userTokenLockedBalance[msg.sender][common.quoteAsset] -= poolOwnership;
      userTokenBalances[msg.sender][common.quoteAsset] -= poolOwnership;
    }

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      // reset baseAsset locked balance
      userTokenLockedBalance[msg.sender][common.baseAsset] -= poolOwnership;
      userTokenBalances[msg.sender][common.baseAsset] -= poolOwnership;
    }

    uint256 totalSupply = positionPoolTokenTotalSupply[positionHash];

    uint256 quoteBalance = positionPoolTokenBalance[positionHash][common.quoteAsset];
    uint256 quoteBalanceOwed = poolOwnership / totalSupply * quoteBalance;

    uint256 baseBalance = positionPoolTokenBalance[positionHash][common.baseAsset];
    uint256 baseBalanceOwed = poolOwnership / totalSupply * baseBalance;

    userTokenBalances[msg.sender][common.baseAsset] += baseBalanceOwed;
    userTokenBalances[msg.sender][common.quoteAsset] += quoteBalanceOwed;

    // reduce pool size by amount claimed
    positionPoolTokenTotalSupply[positionHash] -= poolOwnership;
    userOptionPosition[msg.sender][positionHash] = 0;
  }

  function announce(OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, OrderLib.Signature memory sig) public {
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    address user = OrderLib.getAddressFromSignedOrder(order, common, sig);
    require(getCurrentNonce(user, positionHash) == order.nonce - 1, "User nonce incorrect");

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.CALL) {
      if(order.isBuy) {
        require(getAvailableBalance(user, common.baseAsset) >= order.price, "Call Buyer must have enough free collateral");
      } else {
        require(getAvailableBalance(user, common.quoteAsset) >= order.size, "Call Seller must have enough free collateral");
      }
    }

    if(OrderLib.OptionType(common.optionType) == OrderLib.OptionType.PUT) {
      if(order.isBuy) {
        require(getAvailableBalance(user, common.baseAsset) >= order.price, "Put Buyer must have enough free collateral");
      } else {
        require(getAvailableBalance(user, common.baseAsset) >= adjustWithRatio(order.size, common.strike), "Put Seller must have enough free collateral");
      }
    }

    emit OrderAnnounce(common, positionHash, user, order, sig);
  }


  function announceMany(OrderLib.SmallOrder[] memory orders, OrderLib.OrderCommon[] memory commons, OrderLib.Signature[] memory sigs) public {
    require(orders.length == commons.length, "Array length mismatch");
    require(orders.length == sigs.length, "Array length mismatch");
    for(uint i = 0; i < orders.length; i++) {
      announce(orders[i], commons[i], sigs[i]);
    }
  }

  function getCommonFromOrder(OrderLib.Order memory order) internal pure returns (OrderLib.OrderCommon memory common) {
    return OrderLib.getCommonFromOrder(order);
  }

  function hashOrder(OrderLib.Order memory order) public pure returns (bytes32) {
    return OrderLib.hashOrder(order);
  }

  function hashSmallOrder(OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common) public pure returns (bytes32) {
    return OrderLib.hashSmallOrder(order, common);
  }

  function hashOrderCommon(OrderLib.OrderCommon memory common) public pure returns(bytes32) {
    return hashOrderCommon(common);
  }

  function getSignedHash(bytes32 hash) internal pure returns (bytes32) {
    return OrderLib.getSignedHash(hash);
  }

  function validateSignature(address user, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure returns(bool) {
    return OrderLib.validateSignature(user, hash, v, r, s);
  }

  function checkOrderMatches(OrderLib.SmallOrder memory sellOrder, OrderLib.SmallOrder memory buyOrder) internal view returns (bool) {
    return OrderLib.checkOrderMatches(sellOrder, buyOrder);
  }

  function getAddressFromSignedOrder(OrderLib.SmallOrder memory order, OrderLib.OrderCommon memory common, OrderLib.Signature memory sig) public pure returns(address) {
    return OrderLib.getAddressFromSignedOrder(order, common, sig);
  }

  function getAddressFromOrderHash(bytes32 orderHash, OrderLib.Signature memory sig) public pure returns(address) {
    return OrderLib.getAddressFromOrderHash(orderHash, sig);
  }
}
