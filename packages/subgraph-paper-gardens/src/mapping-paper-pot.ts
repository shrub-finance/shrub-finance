import { BigInt, log } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS } from '@protofire/subgraph-toolkit'

import {
  decrementFertilizerCount,
  decrementPotCount,
  decrementTicketCount, decrementWaterCount,
  getUser, incrementFertilizerCount,
  incrementPotCount,
  incrementTicketCount, incrementWaterCount,
} from './entities/user'
import { Plant, Grow, TransferBatch, TransferSingle } from '../generated/PaperPot/PaperPot'
import { User } from '../generated/schema'
import { createPottedPlant, growPottedPlant } from './entities/potted-plant'
let One = BigInt.fromI32(1);
let Two = BigInt.fromI32(2);
let Three = BigInt.fromI32(3);
let OneMillion = BigInt.fromI32(1000000);
let TwoMillion = BigInt.fromI32(2000000);
let ThreeMillion = BigInt.fromI32(3000000);

// - ApprovalForAll(indexed address,indexed address,bool)
// - Grow(uint256,uint16,uint16)
// - Plant(uint256,uint256,address)
// - TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])
// - TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)
// - URI(string,indexed uint256)

export function handleTransferSingle(event: TransferSingle): void {
  let operator = event.params.operator
  let tokenId = event.params.id
  let from = event.params.from
  let to = event.params.to
  let value = event.params.value
  let fromUser: User
  let toUser: User
  // 3 Cases
  // Mint, Burn, Transfer
  if (from.toHexString() != ZERO_ADDRESS) {
    fromUser = getUser(from)
  }
  if (to.toHexString() != ZERO_ADDRESS) {
    toUser = getUser(to)
  }

  log.info('tokenId: {}, from: {}, to: {}, value: {}', [tokenId.toString(), from.toHexString(), to.toHexString(), value.toString()]);

  if (tokenId == One) {
    log.info('its a pot', []);
    // Case: Pot
    if (from.toHexString() != ZERO_ADDRESS) {
      log.info('decrementing', []);
      decrementPotCount(fromUser, value);
    }
    if (to.toHexString() != ZERO_ADDRESS) {
      log.info('incrementing', []);
      incrementPotCount(toUser, value);
    }
  } else if (tokenId == Two) {
    // Case: Fertilizer
    if (from.toHexString() != ZERO_ADDRESS) {
      decrementFertilizerCount(fromUser, value);
    }
    if (to.toHexString() != ZERO_ADDRESS) {
      incrementFertilizerCount(toUser, value);
    }
  } else if (tokenId == Three) {
    // Case: Water
    if (from.toHexString() != ZERO_ADDRESS) {
      decrementWaterCount(fromUser, value);
    }
    if (to.toHexString() != ZERO_ADDRESS) {
      incrementWaterCount(toUser, value);
    }
  } else if (tokenId >= OneMillion) {
    // Case: Potted Plant
    if (from.toHexString() == ZERO_ADDRESS) {
      // This is the minting case and will be handled by the Plant event
    }
    if (to.toHexString() == ZERO_ADDRESS) {
      // TODO: This is the burning case, and we need to figure out how to deal with harvesting - likely needs another special
    }
  } else if (tokenId >= TwoMillion && tokenId < ThreeMillion) {
    // Case: Shrub
  } else {
    // This shouldn't happen
    log.error('unexpected tokenId: {}', [tokenId.toString()]);
  }
// if (tokenId != One) {
  //   log.info('unexpected tokenId: {}', [tokenId.toString()]);
  //   return;
  // }
  // if (from.toHexString() != ZERO_ADDRESS) {
  //   let fromUser = getUser(from)
  //   decrementTicketCount(fromUser, value)
  // }
  // if (to.toHexString() != ZERO_ADDRESS) {
  //   let toUser = getUser(to)
  //   incrementTicketCount(toUser, value)
  // }
}
export function handleTransferBatch(event: TransferBatch): void {
  let operator = event.params.operator
  let tokenIds = event.params.ids
  let from = event.params.from
  let to = event.params.to
  let values = event.params.values

  for (let i = 0; i < values.length; i++) {
    // let tokenId = tokenIds[i];
    // let value = values[i];
    // if (tokenId == One) {
    //   // Only count for the first tokenId
    //   if (from.toHexString() != ZERO_ADDRESS) {
    //     let fromUser = getUser(from)
    //     decrementTicketCount(fromUser, value)
    //   }
    //   if (to.toHexString() != ZERO_ADDRESS) {
    //     let toUser = getUser(to)
    //     incrementTicketCount(toUser, value)
    //   }
    // }
  }
}

export function handleGrow(event: Grow): void {
  let tokenId = event.params.tokenId
  let growthBps = event.params.growthBps;
  let growthAmount = event.params.growthAmount;
  growPottedPlant(tokenId, growthBps);
}

export function handlePlant(event: Plant): void {
  let seedTokenId = event.params.seedTokenId;
  let tokenId = event.params.tokenId;
  let account = event.params.account;
  let block = event.block;
  createPottedPlant(tokenId, seedTokenId, account, block);
}
