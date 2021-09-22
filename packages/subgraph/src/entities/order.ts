import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import {
  OrderAnnounceCommonStruct,
  OrderAnnounceOrderStruct,
  ShrubExchange,
  ShrubExchange__hashSmallOrderInputCommonStruct,
  ShrubExchange__hashSmallOrderInputOrderStruct,
} from '../../generated/ShrubExchange/ShrubExchange'
import { BuyOrder, SellOrder } from '../../generated/schema'
import { getOption } from './option'
import { getUser } from './user'
import { decimal } from '@protofire/subgraph-toolkit/index'
import { getToken } from './token'
import { getUserOption } from './userOption'

export function getOrderId(
  shrubAddress: Address,
  smallOrder: OrderAnnounceOrderStruct,
  common: OrderAnnounceCommonStruct
): string {
    let shrubExchange = ShrubExchange.bind(shrubAddress);
    return shrubExchange.hashSmallOrder(
      smallOrder as ShrubExchange__hashSmallOrderInputOrderStruct,
      common as ShrubExchange__hashSmallOrderInputCommonStruct
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
  order.userOption = getUserOption(user, option).id;
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
  order.userOption = getUserOption(user, option).id;
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
  order.save();
  return order;
}
