import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import {
  OrderAnnounceCommonStruct,
  OrderAnnounceOrderStruct,
} from '../../generated/ShrubExchange/ShrubExchange';
import {
  HashUtil,
  HashUtil__hashSmallOrderInputCommonStruct,
  HashUtil__hashSmallOrderInputOrderStruct,
} from '../../generated/ShrubExchange/HashUtil'
import { BuyOrder, SellOrder } from '../../generated/schema'
import { getOption } from './option'
import { getUser } from './user'
import { decimal } from '@protofire/subgraph-toolkit/index'
import { getToken } from './token'
import { getUserOption } from './userOption'

let HASH_UTIL_ADDRESS = Address.fromString('0x6c33305176a646a355d66dc35317db370cd6977b');

export function getOrderId(
  shrubAddress: Address,
  smallOrder: OrderAnnounceOrderStruct,
  common: OrderAnnounceCommonStruct
): string {
  let hashUtil = HashUtil.bind(HASH_UTIL_ADDRESS);
  return hashUtil.hashSmallOrder(
    smallOrder as HashUtil__hashSmallOrderInputOrderStruct,
    common as HashUtil__hashSmallOrderInputCommonStruct
  ).toHex()
}


export function createSellOrder(
  shrubAddress: Address,
  orderAddress: Address,
  smallOrder: OrderAnnounceOrderStruct,
  positionHash: Bytes,
  common: OrderAnnounceCommonStruct,
  block: ethereum.Block
): SellOrder {
  let id = getOrderId(shrubAddress, smallOrder, common);
  let order = new SellOrder(id);
  let user = getUser(orderAddress);
  let option = getOption(positionHash, common);
  order.userOption = getUserOption(user, option, shrubAddress, block).id;
  order.option = option.id;
  order.size = decimal.fromBigInt(smallOrder.size, getToken(common.quoteAsset).decimals);
  order.nonce = smallOrder.nonce.toI32();
  order.price = decimal.fromBigInt(smallOrder.price, getToken(common.baseAsset).decimals);
  order.pricePerContract = order.price.div(order.size);
  // TODO: we should actually check this I think
  order.expiredNonce = false;
  order.funded = true;

  order.offerExpire = smallOrder.offerExpire.toI32();
  order.fee = decimal.fromBigInt(smallOrder.fee);
  order.block = block.number.toI32();
  order.timestamp = block.timestamp.toI32();
  order.cancelDate = 0;
  order.fullyMatched = false;
  order.tradable = true;
  order.save();
  return order;
}

export function createBuyOrder(
  shrubAddress: Address,
  orderAddress: Address,
  smallOrder: OrderAnnounceOrderStruct,
  positionHash: Bytes,
  common: OrderAnnounceCommonStruct,
  block: ethereum.Block
): BuyOrder {
  let id = getOrderId(shrubAddress, smallOrder, common);
  let order = new BuyOrder(id);
  let user = getUser(orderAddress);
  let option = getOption(positionHash, common);
  order.userOption = getUserOption(user, option, shrubAddress, block).id;
  order.option = option.id;
  order.size = decimal.fromBigInt(smallOrder.size, getToken(common.quoteAsset).decimals);
  order.nonce = smallOrder.nonce.toI32();
  order.price = decimal.fromBigInt(smallOrder.price, getToken(common.baseAsset).decimals);
  order.pricePerContract = order.price.div(order.size);
  // TODO: we should actually check this I think
  order.expiredNonce = false;
  order.funded = true;

  order.offerExpire = smallOrder.offerExpire.toI32();
  order.fee = decimal.fromBigInt(smallOrder.fee);
  order.block = block.number.toI32();
  order.timestamp = block.timestamp.toI32();
  order.cancelDate = 0;
  order.fullyMatched = false;
  order.tradable = true;
  order.save();
  return order;
}
