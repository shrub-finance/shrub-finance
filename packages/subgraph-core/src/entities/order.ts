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
import { BuyOrder, SellOrder, UserOption } from '../../generated/schema'
import { getOption } from './option'
import { getUser } from './user'
import { decimal } from '@protofire/subgraph-toolkit/index'
import { getToken } from './token'
import { getUserOption, removeActiveBuyOrder, removeActiveSellOrder } from './userOption'

let HASH_UTIL_ADDRESS = Address.fromString('0x6c33305176a646a355d66dc35317db370cd6977b');

// export function getOrderId(
//   shrubAddress: Address,
//   smallOrder: OrderAnnounceOrderStruct,
//   common: OrderAnnounceCommonStruct
// ): string {
//   let hashUtil = HashUtil.bind(HASH_UTIL_ADDRESS);
//   return hashUtil.hashSmallOrder(
//     smallOrder as HashUtil__hashSmallOrderInputOrderStruct,
//     common as HashUtil__hashSmallOrderInputCommonStruct
//   ).toHex()
// }


export function createSellOrder(
  shrubAddress: Address,
  orderAddress: Address,
  smallOrder: OrderAnnounceOrderStruct,
  positionHash: Bytes,
  common: OrderAnnounceCommonStruct,
  block: ethereum.Block,
  id: Bytes
): SellOrder {
  // let id = getOrderId(shrubAddress, smallOrder, common);
  let order = new SellOrder(id.toHex());
  let user = getUser(orderAddress);
  let option = getOption(positionHash, common);
  let userOption = getUserOption(user, option, shrubAddress, block);
  order.userOption = userOption.id;
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

  let activeSellOrders = userOption.activeSellOrders;
  activeSellOrders.push(order.id);
  userOption.activeSellOrders = activeSellOrders;
  userOption.save();

  return order;
}

export function createBuyOrder(
  shrubAddress: Address,
  orderAddress: Address,
  smallOrder: OrderAnnounceOrderStruct,
  positionHash: Bytes,
  common: OrderAnnounceCommonStruct,
  block: ethereum.Block,
  id: Bytes
): BuyOrder {
  // let id = getOrderId(shrubAddress, smallOrder, common);
  let order = new BuyOrder(id.toHex());
  let user = getUser(orderAddress);
  let option = getOption(positionHash, common);
  let userOption = getUserOption(user, option, shrubAddress, block);
  order.userOption = userOption.id;
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

  let activeBuyOrders = userOption.activeBuyOrders;
  activeBuyOrders.push(order.id);
  userOption.activeBuyOrders = activeBuyOrders;
  userOption.save();

  return order;
}

export function setSellOrderExpiredNonce(sellOrder: SellOrder, block: ethereum.Block): SellOrder {
  sellOrder.expiredNonce = true;
  sellOrder.tradable = false;
  sellOrder.cancelDate = block.timestamp.toI32();

  let userOption = UserOption.load(sellOrder.userOption) as UserOption;
  removeActiveSellOrder(userOption, sellOrder.id);

  sellOrder.save();
  return sellOrder
}

export function setBuyOrderExpiredNonce(buyOrder: BuyOrder, block: ethereum.Block): BuyOrder {
  buyOrder.expiredNonce = true;
  buyOrder.tradable = false;
  buyOrder.cancelDate = block.timestamp.toI32();
  let userOption = UserOption.load(buyOrder.userOption) as UserOption;
  removeActiveBuyOrder(userOption, buyOrder.id);
  buyOrder.save();
  return buyOrder
}

export function setSellOrderUnfunded(sellOrder: SellOrder): SellOrder {
  sellOrder.funded = false;
  sellOrder.tradable = false;
  let userOption = UserOption.load(sellOrder.userOption) as UserOption;
  removeActiveSellOrder(userOption, sellOrder.id);
  sellOrder.save();
  return sellOrder;
}

export function setBuyOrderUnfunded(buyOrder: BuyOrder): BuyOrder {
  buyOrder.funded = false;
  buyOrder.tradable = false;
  let userOption = UserOption.load(buyOrder.userOption) as UserOption;
  removeActiveBuyOrder(userOption, buyOrder.id);
  buyOrder.save();
  return buyOrder;
}
