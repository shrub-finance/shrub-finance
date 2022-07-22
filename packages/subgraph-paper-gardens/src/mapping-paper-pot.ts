import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS } from '@protofire/subgraph-toolkit'

import {
  decrementFertilizerCount,
  decrementPotCount,
  decrementTicketCount, decrementWaterCount,
  getUser, incrementFertilizerCount,
  incrementPotCount,
  incrementTicketCount, incrementWaterCount,
} from './entities/user'
import { Plant, Grow, TransferBatch, TransferSingle, Harvest, URI, Happy } from '../generated/PaperPot/PaperPot'
import { User } from '../generated/schema'
import {
  changePottedPlantOwner,
  createPottedPlant, getPottedPlant,
  growPottedPlant,
  updatePottedPlantUri,
} from './entities/potted-plant'
import { createShrub, updateShrubUri } from './entities/shrub'
import { recordPlant } from './entities/typestats'
import { getSeed, updateEmotion } from './entities/seed'
let One = BigInt.fromI32(1);
let Two = BigInt.fromI32(2);
let Three = BigInt.fromI32(3);
let OneMillion = BigInt.fromI32(1000000);
let TwoMillion = BigInt.fromI32(2000000);
let ThreeMillion = BigInt.fromI32(3000000);

function transfer(tokenId: BigInt, from: Address, to: Address, value: BigInt): void {
  let fromUser: User
  let toUser: User
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
    if (from.toHexString() != ZERO_ADDRESS) {
      // skip the minting case and will be handled by the Plant event
      changePottedPlantOwner(tokenId, to)
    }
    // if (to.toHexString() == ZERO_ADDRESS) {
    //   // TODO: This is the burning case, and we need to figure out how to deal with harvesting - likely needs another special
    // }
  } else if (tokenId >= TwoMillion && tokenId < ThreeMillion) {
    // Case: Shrub
  } else {
    // This shouldn't happen
    log.error('unexpected tokenId: {}', [tokenId.toString()]);
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let operator = event.params.operator
  let tokenId = event.params.id
  let from = event.params.from
  let to = event.params.to
  let value = event.params.value
  transfer(tokenId, from, to, value)
}
export function handleTransferBatch(event: TransferBatch): void {
  let operator = event.params.operator
  let tokenIds = event.params.ids
  let from = event.params.from
  let to = event.params.to
  let values = event.params.values

  for (let i = 0; i < values.length; i++) {
    let tokenId = tokenIds[i]
    let value = values[i]
    transfer(tokenId, from, to, value)
  }
}

export function handleGrow(event: Grow): void {
  let tokenId = event.params.tokenId
  let growthBps = event.params.growthBps;
  let growthAmount = event.params.growthAmount;
  let block = event.block;
  growPottedPlant(tokenId, growthBps, block);
}

export function handlePlant(event: Plant): void {
  let seedTokenId = event.params.seedTokenId;
  let tokenId = event.params.tokenId;
  let account = event.params.account;
  let block = event.block;
  createPottedPlant(tokenId, seedTokenId, account, block);
}

export function handleHarvest(event: Harvest): void {
  let account = event.params.account
  let pottedPlantTokenId = event.params.pottedPlantTokenId
  let shrubTokenId = event.params.shrubTokenId
  let block = event.block;
  createShrub(shrubTokenId, pottedPlantTokenId, account, block);
}

export function handleUri(event: URI): void {
  let tokenId = event.params.id;
  let uri = event.params.value;
  // Handle case of Paper Pot
  if (tokenId.gt(OneMillion) && tokenId.lt(TwoMillion)) {
    updatePottedPlantUri(tokenId, uri);
  }
  // Handle case of Shrub
  if (tokenId.gt(TwoMillion)) {
    updateShrubUri(tokenId, uri);
  }
}

export function handleHappy(event: Happy): void {
  let pottedPlantTokenId = event.params.tokenId;
  let pottedPlant = getPottedPlant(pottedPlantTokenId);
  let seed = getSeed(BigInt.fromString(pottedPlant.seed));
  updateEmotion(seed, "happy");
}
