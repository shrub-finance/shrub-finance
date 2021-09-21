/// <reference path="../node_modules/assemblyscript/index.d.ts" />

import { NewGravatar, UpdatedGravatar } from '../generated/Gravity/Gravity'
import { Deposit, Withdraw, OrderAnnounce, OrderMatched } from '../generated/ShrubExchange/ShrubExchange'
import { Gravatar, Order, User } from '../generated/schema'
import {Address, BigDecimal, BigInt, log} from '@graphprotocol/graph-ts'
import {getUser} from "./entities/user";
import {getToken} from "./entities/token";
import {getTokenBalance} from "./entities/tokenBalance";
import {weiToEth} from "./utils"
import {getOption} from "./entities/option";

export function handleDeposit(event: Deposit): void {
  let userAddress = event.params.user;
  let tokenAddress = event.params.token;
  log.info('user: {} - amount: {} - token: {}', [userAddress.toHex(), event.params.amount.toString(), tokenAddress.toHex()]);
  let user = getUser(userAddress);
  let token = getToken(tokenAddress);
  // Convert amount to a decimal
  // TODO: need to make this work with any number of decimals
  // let amount = event.params.amount.divDecimal(BigDecimal.fromString(`1e18`));
  let amount = weiToEth(event.params.amount);
  let tokenBalance = getTokenBalance(userAddress, tokenAddress, event.block);
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
  // Convert amount to a decimal
  // TODO: need to make this work with any number of decimals
  // let amount = event.params.amount.divDecimal(BigDecimal.fromString(`1e18`));
  let amount = weiToEth(event.params.amount);
  let tokenBalance = getTokenBalance(userAddress, tokenAddress, event.block);
  tokenBalance.block = event.block.number.toI32();
  tokenBalance.timestamp = event.block.timestamp.toI32();
  tokenBalance.unlockedBalance = tokenBalance.unlockedBalance.minus(amount);
  tokenBalance.save();

}

export function handleOrderAnnounce(event: OrderAnnounce): void {
  let userAddress = event.params.user;
  let smallOrder = event.params.order;
  let common = event.params.common;
  let positionHash = event.params.positionHash;
  let txid = event.transaction.hash.toHex();
  let logIndex = event.logIndex.toI32();
  let id = txid + "-" + logIndex.toString();

  let order = Order.load(id);
  if (order === null) {
    // We would expect this
    order = new Order(id);
    order.option = getOption(positionHash, common).id;
    order.size = weiToEth(smallOrder.size);
    order.isBuy = smallOrder.isBuy;
    order.nonce = smallOrder.nonce.toI32();
    order.price = weiToEth(smallOrder.price);
    order.offerExpire = smallOrder.offerExpire.toI32();
    order.fee = weiToEth(smallOrder.fee);
    order.save();
  }
}

export function handleOrderMatched(event: OrderMatched): void {

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
