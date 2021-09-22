/// <reference path="../node_modules/assemblyscript/index.d.ts" />

import { NewGravatar, UpdatedGravatar } from '../generated/Gravity/Gravity'
import {
  Deposit,
  Withdraw,
  OrderAnnounce,
  OrderMatched,
  ShrubExchange__hashSmallOrderInputOrderStruct,
  ShrubExchange__hashSmallOrderInputCommonStruct, OrderAnnounceCommonStruct, OrderAnnounceOrderStruct,
} from '../generated/ShrubExchange/ShrubExchange'
import { Gravatar, BuyOrder, SellOrder, User, Match, Option } from '../generated/schema'
import {Address, BigDecimal, BigInt, log} from '@graphprotocol/graph-ts'
import {getUser} from "./entities/user";
import {getToken} from "./entities/token";
import { getOrderId, createSellOrder, createBuyOrder } from './entities/order'
import {getTokenBalance} from "./entities/tokenBalance";
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
    match.save();
  }
}

  export function handleNewGravatar(event: NewGravatar): void {
  let gravatar = new Gravatar(event.params.id.toHex())
  gravatar.owner = event.params.owner
  gravatar.displayName = event.params.displayName
  gravatar.imageUrl = event.params.imageUrl
  gravatar.save()
}

export function handleUpdatedGravatar(event: UpdatedGravatar): void {
  let id = event.params.id.toHex()
  let gravatar = Gravatar.load(id)
  if (gravatar == null) {
    gravatar = new Gravatar(id)
  }
  gravatar.owner = event.params.owner
  gravatar.displayName = event.params.displayName
  gravatar.imageUrl = event.params.imageUrl
  gravatar.save()
}
