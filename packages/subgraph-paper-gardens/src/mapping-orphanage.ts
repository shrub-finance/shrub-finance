
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
import { getName, getSeed, getType, updateOwner } from './entities/seed'
import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS } from '@protofire/subgraph-toolkit'



// - event: Add(uint256)
// handler: handleAdd
// - event: Remove(uint256)
// handler: handleRemove
// - event: ClearRegister()
// handler: handleClearRegister
// - event: Register(address)
// handler: handleRegister
// - event: Deliver(uint256,address)
// handler: handleDeliver


import {Add, Remove, ClearRegister, Register, Deliver} from '../generated/SeedOrphanage/SeedOrphanage';
import { Seed } from '../generated/schema'
import { recordClaim } from './entities/typestats'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { AdoptionRecord } from '../generated/schema'

export function handleAdd(event: Add): void {}
export function handleRemove(event: Remove): void {}
export function handleClearRegister(event: ClearRegister): void {}
export function handleRegister(event: Register): void {}
export function handleDeliver(event: Deliver): void {
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  let timestamp = event.block.timestamp.toI32();
  let block = event.block.number.toI32();
  let id = tokenId.toString() + '-' + timestamp.toString();
  let adoptionRecord = AdoptionRecord.load(id);
  if (adoptionRecord !== null) {
    throw new Error(`AdoptionRecord with id ${id} already exists`);
  }
  let userObj = getUser(user)
  let seedObj = getSeed(tokenId);
  adoptionRecord = new AdoptionRecord(id);
  adoptionRecord.seed = seedObj.id;
  adoptionRecord.user = userObj.id;
  adoptionRecord.block = block;
  adoptionRecord.timestamp = timestamp;
  adoptionRecord.save();
}
