/// <reference path="../node_modules/assemblyscript/index.d.ts" />

import {
  Deposit,
  Withdraw,
  OrderAnnounce,
  OrderMatched,
  OrderAnnounceCommonStruct,
  OrderAnnounceOrderStruct, ExerciseCall, Exercised, Cancelled,
} from '../generated/ShrubExchange/ShrubExchange'
import { BuyOrder, SellOrder, User, Match, Option, UserOption, TokenBalance, Token } from '../generated/schema'
import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import {getUser} from "./entities/user";
import {getToken} from "./entities/token";
import { getUserOption, getBalance, updateUserOptionBalance, updateUserOptionNonce } from './entities/userOption'
import {
  // getOrderId,
  createSellOrder,
  createBuyOrder,
  setBuyOrderUnfunded,
  setSellOrderUnfunded,
} from './entities/order'
import { getTokenBalance, updateTokenBalance } from './entities/tokenBalance'
import {getOption, setOptionOnMatch} from "./entities/option";
import { integer, decimal, DEFAULT_DECIMALS, ZERO_ADDRESS } from '@protofire/subgraph-toolkit'
import { ShrubExchange } from "../generated/ShrubExchange/ShrubExchange";


// AssemblyScript Globals
var option: Option;
var userOption: UserOption;

export function handleDeposit(event: Deposit): void {
  let userAddress = event.params.user;
  let tokenAddress = event.params.token;
  log.info('user: {} - amount: {} - token: {}', [userAddress.toHex(), event.params.amount.toString(), tokenAddress.toHex()]);
  let user = getUser(userAddress);
  let token = getToken(tokenAddress);
  let amount = decimal.fromBigInt(event.params.amount, token.decimals)
  let tokenBalance = getTokenBalance(Address.fromString(user.id), tokenAddress, event.block);
  tokenBalance.block = event.block.number.toI32();
  tokenBalance.timestamp = event.block.timestamp.toI32();
  tokenBalance.unlockedBalance = tokenBalance.unlockedBalance.plus(amount);
  tokenBalance.save();
}

export function handleWithdraw(event: Withdraw): void {
  let userAddress = event.params.user;
  let tokenAddress = event.params.token;
  let block = event.block;
  log.info('user: {} - amount: {} - token: {}', [userAddress.toHex(), event.params.amount.toString(), tokenAddress.toHex()]);
  let user = getUser(userAddress);
  let token = getToken(tokenAddress);
  let amount = decimal.fromBigInt(event.params.amount, token.decimals)
  let tokenBalance = getTokenBalance(Address.fromString(user.id), tokenAddress, event.block);
  tokenBalance.block = event.block.number.toI32();
  tokenBalance.timestamp = event.block.timestamp.toI32();
  tokenBalance.unlockedBalance = tokenBalance.unlockedBalance.minus(amount);
  tokenBalance.save();
  checkCollateralForOutstandingOrders(user, [tokenAddress], block);
}

export function handleExercised(event: Exercised): void {
  let user = event.params.user;
  let positionHash = event.params.positionHash;
  // let amount = event.params.amount;
  let shrubAddress = event.address;
  let block = event.block;
  option = Option.load(positionHash.toHex()) as Option;
  let userObj = getUser(user);
  userOption = getUserOption(userObj, option, shrubAddress, block);
  let baseAsset = Address.fromString(option.baseAsset);
  let quoteAsset = Address.fromString(option.quoteAsset);

  // Update userOptions of the exerciser
  updateUserOptionBalance(userOption, shrubAddress);

  // Update tokenBalance of the exerciser
  let baseTokenBalance = getTokenBalance(user, baseAsset, block)
  let quoteTokenBalance = getTokenBalance(user, quoteAsset, block);
  updateTokenBalance(baseTokenBalance, shrubAddress);
  updateTokenBalance(quoteTokenBalance, shrubAddress);

  // Run check collateral for orders that user the currency that was used to exercise
  checkCollateralForOutstandingOrders(userObj, [baseAsset, quoteAsset], block);

  // Update tokenBalance of the optionPool (need to make concept of optionPool first)
}

export function handleCancelled(event: Cancelled): void {
  let userStr = event.params.user;
  let positionHash = event.params.positionHash;
  let nonce = event.params.nonce;
  let shrubAddress = event.address;
  let block = event.block;
  let user = getUser(userStr);
  option = Option.load(positionHash.toHex()) as Option;
  userOption = getUserOption(user, option, shrubAddress, block);
  updateUserOptionNonce(userOption, nonce, block);
}

function checkCollateralForOutstandingOrders(user: User, tokenAddresses: Address[], block: ethereum.Block): void {
  // Collateral Requirements for an order
  // BuyOrder
  //  Call - total price of the order in baseAsset (USD)
  //  Put - total price of the order in baseAsset (USD)
  // SellOrder
  //  Call - size of the order in quoteAsset (MATIC)
  //  Put - size of the order * strike price in baseAsset (USD)

  var unlockedBalances = new Map<Address, BigDecimal>();
  log.info("tokenAddresses: {}, {}", [tokenAddresses[0].toHex(), tokenAddresses[1].toHex()]);
  for (let i = 0; i < tokenAddresses.length; i++) {
    let tokenAddress = tokenAddresses[i];
    let tokenBalance = getTokenBalance(Address.fromString(user.id), tokenAddress, block);
    unlockedBalances.set(tokenAddress, tokenBalance.unlockedBalance);
  }

  let activeUserOptions = user.activeUserOptions;
  for (let i = 0; i < activeUserOptions.length; i++) {
    let userOptionStr = activeUserOptions[i];
    userOption = UserOption.load(userOptionStr) as UserOption;
    option = Option.load(userOption.option) as Option;
    let baseAssetMatches = tokenAddresses.filter(tokenAddress => tokenAddress.toHex() == option.baseAsset)
    let quoteAssetMatches = tokenAddresses.filter(tokenAddress => tokenAddress.toHex() == option.quoteAsset)
    // Iterate through baseAssetMatches
    for (let j = 0; j < baseAssetMatches.length; j++) {
      let baseAsset = baseAssetMatches[j];
      // Test the buyOrders for this userOption
      // Find buyOrders for user that have baseAsset=token and totalPrice < tokenbalance
      let activeBuyOrders = userOption.activeBuyOrders;
      for (let k = 0; k < activeBuyOrders.length; k++) {
        let buyOrderStr = activeBuyOrders[k];
        let buyOrder = BuyOrder.load(buyOrderStr) as BuyOrder;
        if (buyOrder.price > unlockedBalances.get(baseAsset)) {
          setBuyOrderUnfunded(buyOrder);
        }
      }
      // Test the sellOrders for this userOption
      // Find sellOrders that are PUT and baseAsset=token and size * strike < tokenbalance
      let activeSellOrders = userOption.activeSellOrders;
      for (let k = 0; k < activeSellOrders.length; k++) {
        let sellOrderStr = activeSellOrders[k];
        if (option.optionType == 'PUT') {
          let sellOrder = SellOrder.load(sellOrderStr) as SellOrder;
          if (sellOrder.size.times(option.strike) > unlockedBalances.get(baseAsset)) {
            setSellOrderUnfunded(sellOrder);
          }
        }
      }
    }
    // Iterate through quoteAssetMatches
    for (let j = 0; j < quoteAssetMatches.length; j++) {
      let quoteAsset = quoteAssetMatches[j];
      // Test the sellOrders for the userOption
      // Find sellOrders that are CALL and quoteAsset=token and size < tokenbalance
      let activeSellOrders = userOption.activeSellOrders;
      for (let k = 0; k < activeSellOrders.length; k++) {
        let sellOrderStr = activeSellOrders[k];
        if (option.optionType == 'CALL') {
          let sellOrder = SellOrder.load(sellOrderStr) as SellOrder;
          if (sellOrder.size.lt(unlockedBalances.get(quoteAsset))) {
            setSellOrderUnfunded(sellOrder);
          }
        }
      }
    }
  }
}

export function handleOrderAnnounce(event: OrderAnnounce): void {
  let userAddress = event.params.user;
  let smallOrder = event.params.order
  let common = event.params.common;
  let positionHash = event.params.positionHash;
  let address = event.address;
  let id = event.params.orderId;
  // let id = getOrderId(address, smallOrder, common);
  if (smallOrder.isBuy) {
    let order = BuyOrder.load(id.toHex());
    if (order === null) {
      // We would expect this
      createBuyOrder(event.address, userAddress, smallOrder, positionHash, common, event.block, id);
    }
  } else {
    let order = SellOrder.load(id.toHex());
    if (order === null) {
      createSellOrder(event.address, userAddress, smallOrder, positionHash, common, event.block, id);
    }
  }
}

export function handleOrderMatched(event: OrderMatched): void {
  let buyOrder = event.params.buyOrder;
  let sellOrder = event.params.sellOrder;
  let common = event.params.common;
  let positionHash = event.params.positionHash;
  let buyer = event.params.buyer;
  let seller = event.params.seller;
  let buyId = event.params.buyOrderId.toHex();
  let sellId = event.params.sellOrderId.toHex();
  let shrubAddress = event.address;
  let block = event.block;
  option = getOption(positionHash, common as OrderAnnounceCommonStruct);
  // let buyId = getOrderId(shrubAddress, buyOrder as OrderAnnounceOrderStruct, common as OrderAnnounceCommonStruct);
  // let sellId = getOrderId(shrubAddress, sellOrder as OrderAnnounceOrderStruct, common as OrderAnnounceCommonStruct);
  log.info('Matching: buyOrder: {}, sellOrder: {}', [buyId, sellId]);
  let id = buyId + "-" + sellId;
  let match = Match.load(id);
  if (match === null) {
    let quoteToken = getToken(common.quoteAsset);
    let baseToken = getToken(common.baseAsset);
    // contract: uint fillSize = min(sellOrder.size, buyOrder.size);
    let fillSize = integer.min(sellOrder.size, buyOrder.size);
    match = new Match(id);
    let buyOrderObj = BuyOrder.load(buyId);
    let sellOrderObj = SellOrder.load(sellId);
    if (buyOrderObj == null) {
      buyOrderObj = createBuyOrder(shrubAddress, buyer, buyOrder as OrderAnnounceOrderStruct, positionHash, common as OrderAnnounceCommonStruct, block, event.params.buyOrderId);
    }
    if (sellOrderObj == null) {
      sellOrderObj = createSellOrder(shrubAddress, seller, sellOrder as OrderAnnounceOrderStruct, positionHash, common as OrderAnnounceCommonStruct, block, event.params.sellOrderId);
    }
    // TODO: once we support partial matching, we need to check if the full size of the order has been consumed
    buyOrderObj.fullyMatched = true;
    buyOrderObj.tradable = false;
    sellOrderObj.fullyMatched = true;
    sellOrderObj.tradable = false;

    // Load the relevant userOptions and update them
    let buyUserOption = UserOption.load(buyOrderObj.userOption) as UserOption;
    let sellUserOption = UserOption.load(sellOrderObj.userOption) as UserOption;
    updateUserOptionBalance(buyUserOption, shrubAddress);
    updateUserOptionBalance(sellUserOption, shrubAddress);
    updateUserOptionNonce(buyUserOption, BigInt.fromI32(buyOrderObj.nonce), block);
    updateUserOptionNonce(sellUserOption, BigInt.fromI32(sellOrderObj.nonce), block);

    // Load the relevant tokenBalances and update them
    let buyBaseTokenBalance = getTokenBalance(buyer, common.baseAsset, block);
    let buyQuoteTokenBalance = getTokenBalance(buyer, common.quoteAsset, block);
    let sellBaseTokenBalance = getTokenBalance(seller, common.baseAsset, block);
    let sellQuoteTokenBalance = getTokenBalance(seller, common.quoteAsset, block);
    updateTokenBalance(buyBaseTokenBalance, shrubAddress);
    updateTokenBalance(buyQuoteTokenBalance, shrubAddress);
    updateTokenBalance(sellBaseTokenBalance, shrubAddress);
    updateTokenBalance(sellQuoteTokenBalance, shrubAddress);

    // Find other orders for the same option with the same user and see if they got disqualified due to nonce

    match.buyOrder = buyOrderObj.id;
    match.sellOrder = sellOrderObj.id;
    match.totalFee = decimal.fromBigInt(buyOrder.fee.plus(sellOrder.fee));
    match.size = decimal.fromBigInt(fillSize, quoteToken.decimals);
    match.finalPrice = decimal.fromBigInt(fillSize.times(sellOrder.price).div(sellOrder.size), baseToken.decimals);
    match.finalPricePerContract = match.finalPrice.div(match.size);
    match.block = block.number.toI32();
    match.timestamp = block.timestamp.toI32();

    setOptionOnMatch(positionHash, match.size, match.finalPricePerContract);
    // TODO: Check if there are any orders from the users that need to be invalidated due to nonce increment
    buyOrderObj.save();
    sellOrderObj.save();
    match.save();
  }
}
