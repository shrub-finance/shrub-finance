import { User, Option, UserOption } from '../../generated/schema'
import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { ShrubExchange } from '../../generated/ShrubExchange/ShrubExchange'
import { decimal } from '@protofire/subgraph-toolkit'
import { getToken } from './token'

export function createUserOption(user: User, option: Option, shrubAddress: Address, block: ethereum.Block): UserOption {
  let id = getUserOptionId(user, option);
  let userOption = new UserOption(id);
  userOption.user = user.id;
  userOption.option = option.id;
  userOption.nonce = getNonce(user, option, shrubAddress);
  userOption.balance = getBalance(user, option, shrubAddress);
  userOption.block = block.number.toI32();
  userOption.timestamp = block.timestamp.toI32();
  userOption.save();
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
