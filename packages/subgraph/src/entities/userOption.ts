import { User, Option, UserOption, BuyOrder, SellOrder } from '../../generated/schema'
import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { ShrubExchange } from '../../generated/ShrubExchange/ShrubExchange'
import { decimal } from '@protofire/subgraph-toolkit'
import { getToken } from './token'
import { setBuyOrderExpiredNonce, setSellOrderExpiredNonce } from './order'

export function createUserOption(user: User, option: Option, shrubAddress: Address, block: ethereum.Block): UserOption {
  let id = getUserOptionId(user, option);
  let userOption = new UserOption(id);
  userOption.user = user.id;
  userOption.option = option.id;
  userOption.nonce = getNonce(user, option, shrubAddress);
  userOption.balance = getBalance(user, option, shrubAddress);
  userOption.block = block.number.toI32();
  userOption.timestamp = block.timestamp.toI32();
  userOption.activeBuyOrders = [];
  userOption.activeSellOrders = [];
  userOption.save();

  let activeUserOptions = user.activeUserOptions;
  activeUserOptions.push(id);
  user.activeUserOptions = activeUserOptions;
  user.save();

  return userOption;
}

export function getNonce(user: User, option: Option, shrubAddress: Address): BigInt {
  let shrubExchange = ShrubExchange.bind(shrubAddress);
  let nonce = shrubExchange.getCurrentNonceFromHash(Address.fromString(user.id), Bytes.fromHexString(option.id) as Bytes);
  return nonce;
}

export function getBalance(user: User, option: Option, shrubAddress: Address): BigDecimal {
  let shrubExchange = ShrubExchange.bind(shrubAddress);
  let quoteAsset = getToken(Address.fromString(option.quoteAsset));
  let decimals = quoteAsset.decimals;
  let balance = decimal.ZERO;
  let optionPosition = shrubExchange.try_userOptionPosition(Address.fromString(user.id), Bytes.fromHexString(option.id) as Bytes);
  if (!optionPosition.reverted) {
    balance = decimal.fromBigInt(optionPosition.value as BigInt, decimals);
  }
  return balance as BigDecimal;
}

export function updateUserOptionBalance(userOption: UserOption, shrubAddress: Address): UserOption {
  let user = User.load(userOption.user);
  let option = Option.load(userOption.option);
  userOption.balance = getBalance(user as User, option as Option, shrubAddress);
  userOption.save();
  return userOption;
}

export function updateUserOptionNonce(userOption: UserOption, nonce: BigInt, block: ethereum.Block): UserOption {
  userOption.nonce = nonce;
  // log.info("buyOrders : {}", [userOption.buyOrders == null ? "true" : "false"]);
  let activeBuyOrders = userOption.activeBuyOrders;
  let activeSellOrders = userOption.activeSellOrders;
  if (activeBuyOrders.length > 0) {
    for (let i = 0; i < activeBuyOrders.length; i++) {
      // let buyOrderStr = userOption.activeBuyOrders[i];
      let buyOrder = BuyOrder.load(activeBuyOrders[i]) as BuyOrder;
      if (BigInt.fromI32(buyOrder.nonce) <= nonce) {
        // Order now has an invalid nonce
        setBuyOrderExpiredNonce(buyOrder, block);
      }
    }
  }
  if (activeSellOrders.length > 0) {
    for (let i = 0; i < activeSellOrders.length; i++) {
      let sellOrder = SellOrder.load(activeSellOrders[i]) as SellOrder;
      if (BigInt.fromI32(sellOrder.nonce) <= nonce) {
        // Order now has an invalid nonce
        setSellOrderExpiredNonce(sellOrder, block);
      }
    }
  }
  userOption.save();
  return userOption
}

export function removeActiveBuyOrder(userOption: UserOption, buyOrderId: string): void {
  let activeBuyOrders = userOption.activeBuyOrders;
  let index = activeBuyOrders.indexOf(buyOrderId);
  if (index >= 0) {
    activeBuyOrders.splice(index, 1);
  }
  userOption.activeBuyOrders = activeBuyOrders;
  userOption.save();
}

export function removeActiveSellOrder(userOption: UserOption, sellOrderId: string): void {
  let activeSellOrders = userOption.activeSellOrders;
  let index = activeSellOrders.indexOf(sellOrderId);
  if (index >= 0) {
    activeSellOrders.splice(index, 1);
  }
  userOption.activeSellOrders = activeSellOrders;
  userOption.save();
}

export function getUserOptionId(user: User, option: Option): string {
  return user.id + "-" + option.id;
}

export function getUserOption(user: User, option: Option, shrubAddress: Address, block: ethereum.Block): UserOption {
  let id = getUserOptionId(user, option);
  let userOption = UserOption.load(id);

  // If no userOption, create one
  if (userOption === null) {
    userOption = createUserOption(user, option, shrubAddress, block);
  }
  return userOption as UserOption;
}
