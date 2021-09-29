/// <reference path="../node_modules/assemblyscript/index.d.ts" />

import {
  Deposit,
  Withdraw,
  OrderAnnounce,
  OrderMatched,
  OrderAnnounceCommonStruct,
  OrderAnnounceOrderStruct, ExerciseCall, Exercised,
} from '../generated/ShrubExchange/ShrubExchange'
import { BuyOrder, SellOrder, User, Match, Option, UserOption, TokenBalance, Token } from '../generated/schema'
import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import {getUser} from "./entities/user";
import {getToken} from "./entities/token";
import { getUserOption, getBalance, updateUserOptionBalance } from './entities/userOption'
import { getOrderId, createSellOrder, createBuyOrder } from './entities/order'
import { getTokenBalance, updateTokenBalance } from './entities/tokenBalance'
import {getOption, setOptionOnMatch} from "./entities/option";
import { integer, decimal, DEFAULT_DECIMALS, ZERO_ADDRESS } from '@protofire/subgraph-toolkit'
import { ShrubExchange } from "../generated/ShrubExchange/ShrubExchange";

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
  log.info('user: {} - amount: {} - token: {}', [userAddress.toHex(), event.params.amount.toString(), tokenAddress.toHex()]);
  let user = getUser(userAddress);
  let token = getToken(tokenAddress);
  let amount = decimal.fromBigInt(event.params.amount, token.decimals)
  let tokenBalance = getTokenBalance(Address.fromString(user.id), tokenAddress, event.block);
  tokenBalance.block = event.block.number.toI32();
  tokenBalance.timestamp = event.block.timestamp.toI32();
  tokenBalance.unlockedBalance = tokenBalance.unlockedBalance.minus(amount);
  tokenBalance.save();
}

export function handleExercised(event: Exercised) {
  let user = event.params.user;
  let positionHash = event.params.positionHash;
  let amount = event.params.amount;
  let shrubAddress = event.address;
  let block = event.block;
  let option = Option.load(positionHash.toHex());
  let userObj = getUser(user);
  let userOption = getUserOption(userObj, option, shrubAddress, block);

  // Update userOptions of the exerciser
  updateUserOptionBalance(userOption, shrubAddress);

  // Update tokenBalance of the exerciser
  let baseTokenBalance = getTokenBalance(user, Address.fromString(option.baseAsset), block)
  let quoteTokenBalance = getTokenBalance(user, Address.fromString(option.quoteAsset), block);
  updateTokenBalance(baseTokenBalance, shrubAddress);
  updateTokenBalance(quoteTokenBalance, shrubAddress);

  // Run check collateral for orders that user the currency that was used to exercise

  // Update tokenBalance of the optionPool (need to make concept of optionPool first)
}

function checkCollateralForOutstandingOrders(user: User, tokenAddresses: Address[], block: ethereum.Block) {
  // Collateral Requirements for an order
  // BuyOrder
  //  Call - total price of the order in baseAsset (USD)
  //  Put - total price of the order in baseAsset (USD)
  // SellOrder
  //  Call - size of the order in quoteAsset (MATIC)
  //  Put - size of the order * strike price in baseAsset (USD)

  // get all relevant tokenBalances
  let relevantTokenBalances = tokenAddresses.map((tokenAddress) => {
    return getTokenBalance(Address.fromString(user.id), tokenAddress, block)
  })

  for (let userOptionStr of user.userOptions) {
    let userOption = UserOption.load(userOptionStr);
    let option = Option.load(userOption.option);
    const baseAssetMatches = tokenAddresses.find(tokenAddress => tokenAddress.toHex() == option.baseAsset)
    const quoteAssetMatches = tokenAddresses.find(tokenAddress => tokenAddress.toHex() == option.quoteAsset)
  }

  // Find buyOrders for user that have baseAsset=token and totalPrice < tokenbalance
  // Find sellOrders that are PUT and baseAsset=token and size * totalPrice < tokenbalance
  // Find sellOrders that are CALL and quoteAsset=token and size < tokenbalance
}

export function handleOrderAnnounce(event: OrderAnnounce): void {
  let userAddress = event.params.user;
  let smallOrder = event.params.order
  let common = event.params.common;
  let positionHash = event.params.positionHash;
  let address = event.address;
  let id = getOrderId(address, smallOrder, common);
  if (smallOrder.isBuy) {
    let order = BuyOrder.load(id);
    if (order === null) {
      // We would expect this
      createBuyOrder(event.address, userAddress, smallOrder, positionHash, common, event.block);
    }
  } else {
    let order = SellOrder.load(id);
    if (order === null) {
      createSellOrder(event.address, userAddress, smallOrder, positionHash, common, event.block);
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
  let shrubAddress = event.address;
  let buyerUser = getUser(buyer);
  let sellerUser = getUser(seller);
  let option = getOption(positionHash, common as OrderAnnounceCommonStruct);
  let buyId = getOrderId(shrubAddress, buyOrder as OrderAnnounceOrderStruct, common as OrderAnnounceCommonStruct);
  let sellId = getOrderId(shrubAddress, sellOrder as OrderAnnounceOrderStruct, common as OrderAnnounceCommonStruct);
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
    let sellOrderObj = SellOrder.load(buyId);
    if (buyOrderObj == null) {
      buyOrderObj = createBuyOrder(shrubAddress, buyer, buyOrder as OrderAnnounceOrderStruct, positionHash, common as OrderAnnounceCommonStruct, event.block);
    }
    if (sellOrderObj == null) {
      sellOrderObj = createSellOrder(shrubAddress, seller, sellOrder as OrderAnnounceOrderStruct, positionHash, common as OrderAnnounceCommonStruct, event.block);
    }
    // TODO: once we support partial matching, we need to check if the full size of the order has been consumed
    buyOrderObj.fullyMatched = true;
    buyOrderObj.tradable = false;
    sellOrderObj.fullyMatched = true;
    sellOrderObj.tradable = false;

    // Load the relevant userOptions and update them
    let buyUserOption = UserOption.load(buyOrderObj.userOption);
    let sellUserOption = UserOption.load(sellOrderObj.userOption);
    updateUserOptionBalance(buyUserOption as UserOption, shrubAddress);
    updateUserOptionBalance(sellUserOption as UserOption, shrubAddress);

    // Load the relevant tokenBalances and update them
    let buyBaseTokenBalance = getTokenBalance(buyer, common.baseAsset, event.block);
    let buyQuoteTokenBalance = getTokenBalance(buyer, common.quoteAsset, event.block);
    let sellBaseTokenBalance = getTokenBalance(seller, common.baseAsset, event.block);
    let sellQuoteTokenBalance = getTokenBalance(seller, common.quoteAsset, event.block);
    updateTokenBalance(buyBaseTokenBalance, shrubAddress);
    updateTokenBalance(buyQuoteTokenBalance, shrubAddress);
    updateTokenBalance(sellBaseTokenBalance, shrubAddress);
    updateTokenBalance(sellQuoteTokenBalance, shrubAddress);

    // Find other orders for the same option with the same user and see if they got disqualified due to nonce

    match.buyOrder = buyOrderObj.id;
    match.sellOrder = sellOrderObj.id;
    match.totalFee = decimal.fromBigInt(buyOrder.fee.plus(sellOrder.fee));
    match.size = decimal.fromBigInt(fillSize, quoteToken.decimals);
    // contract: uint adjustedPrice = fillSize * sellOrder.price / sellOrder.size;
    match.finalPrice = decimal.fromBigInt(fillSize.times(sellOrder.price).div(sellOrder.size), baseToken.decimals);
    match.finalPricePerContract = match.finalPrice.div(match.size);
    match.block = event.block.number.toI32();
    match.timestamp = event.block.timestamp.toI32();

    setOptionOnMatch(positionHash, match.size, match.finalPricePerContract);
    // TODO: Check if there are any orders from the users that need to be invalidated due to nonce increment
    buyOrderObj.save();
    sellOrderObj.save();
    match.save();
  }
}
