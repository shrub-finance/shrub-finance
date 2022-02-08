// - event: Transfer(address,address,uint256)
// handler: handleTransfer
// - event: Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
// handler: handleApproval
// - event: ApprovalForAll(address indexed owner, address indexed operator, bool approved)
// handler: handleApprovalForAll
// - event: OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
// handler: handleOwnershipTransferred
// - event: Claimed(uint256,address,uint256)
// handler: handleClaim

// FOR REFERENCE:
// export function handleDeposit(event: Deposit): void {
//   let userAddress = event.params.user;
//   let tokenAddress = event.params.token;
//   // log.info('user: {} - amount: {} - token: {}', [userAddress.toHex(), event.params.amount.toString(), tokenAddress.toHex()]);
//   let user = getUser(userAddress);
//   let token = getToken(tokenAddress);
//   let amount = decimal.fromBigInt(event.params.amount, token.decimals)
//   let tokenBalance = getTokenBalance(Address.fromString(user.id), tokenAddress, event.block);
//   tokenBalance.block = event.block.number.toI32();
//   tokenBalance.timestamp = event.block.timestamp.toI32();
//   tokenBalance.unlockedBalance = tokenBalance.unlockedBalance.plus(amount);
//   tokenBalance.save();
// }
import {Transfer, Approval, ApprovalForAll, OwnershipTransferred, Claimed} from '../generated/PaperSeed/PaperSeed';
import { decrementCount, getUser, incrementCount } from './entities/user'
import { createSeed, updateOwner } from './entities/seed'
import { Address, log } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS } from '@protofire/subgraph-toolkit'
import { recordClaim } from './entities/typestats'

export function handleTransfer(event: Transfer): void {
  let from = event.params.from;
  let to = event.params.to;
  let tokenId = event.params.tokenId;
  // log.info("from: {}",[from.toHexString()]);
  if (from.toHexString() == ZERO_ADDRESS) {
    // This is a mint
    return;
  }
  let toUser = getUser(to);
  let fromUser = getUser(from);
  decrementCount(fromUser);
  incrementCount(toUser);
  updateOwner(tokenId, Address.fromString(toUser.id));
}

export function handleApproval(event: Approval): void {}
export function handleApprovalForAll(event: ApprovalForAll): void {}
export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleClaim(event: Claimed): void {
  let userAddress = event.params.account;
  let tokenId = event.params.amount;
  let block = event.block;
  let user = getUser(userAddress);
  incrementCount(user);
  createSeed(tokenId, Address.fromString(user.id), block);
}
