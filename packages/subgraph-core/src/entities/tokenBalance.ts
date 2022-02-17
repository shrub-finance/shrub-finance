import { Token, TokenBalance } from '../../generated/schema'
import { Address, BigDecimal, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { updateUserOptionBalance } from './userOption'
import { ShrubExchange } from '../../generated/ShrubExchange/ShrubExchange'
import { decimal } from '@protofire/subgraph-toolkit/index'

export function createTokenBalance(userAddress: Address, tokenAddress: Address, block: ethereum.Block): TokenBalance {
  let id = getTokenBalanceId(userAddress, tokenAddress);
  let tokenBalance = new TokenBalance(id);
  tokenBalance.user = userAddress.toHex();
  tokenBalance.token = tokenAddress.toHex();
  tokenBalance.unlockedBalance = BigDecimal.fromString('0');
  tokenBalance.lockedBalance = BigDecimal.fromString('0');
  tokenBalance.block = block.number.toI32();
  tokenBalance.timestamp = block.timestamp.toI32();
  tokenBalance.save();
  return tokenBalance;
}

export function getTokenBalanceId(userAddress: Address, tokenAddress: Address): string {
  return userAddress.toHex() + '-' + tokenAddress.toHex();
}

export function getTokenBalance(userAddress: Address, tokenAddress: Address, block: ethereum.Block): TokenBalance {
  let id = getTokenBalanceId(userAddress, tokenAddress);
  let tokenBalance = TokenBalance.load(id);

  // If no user, create one
  if (tokenBalance === null) {
    tokenBalance = createTokenBalance(userAddress, tokenAddress, block);
  }
  return tokenBalance as TokenBalance;
}

export function updateTokenBalance(tokenBalance: TokenBalance, shrubAddress: Address): TokenBalance {
  let shrubExchange = ShrubExchange.bind(shrubAddress);
  let token = Token.load(tokenBalance.token);
  let decimals = token.decimals;
  let lockedBalanceInt = shrubExchange.userTokenLockedBalance(Address.fromString(tokenBalance.user), Address.fromString(tokenBalance.token));
  let unlockedBalanceInt = shrubExchange.getAvailableBalance(Address.fromString(tokenBalance.user), Address.fromString(tokenBalance.token));
  tokenBalance.unlockedBalance = decimal.fromBigInt(unlockedBalanceInt, decimals);
  tokenBalance.lockedBalance = decimal.fromBigInt(lockedBalanceInt, decimals);
  tokenBalance.save();
  return tokenBalance;
}
