import { BigInt, log } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS } from '@protofire/subgraph-toolkit'

import { decrementTicketCount, getUser, incrementTicketCount } from './entities/user'
import { TransferSingle, TransferBatch } from '../generated/PotNFTTicket/PotNFTTicket'
let One = BigInt.fromI32(1);

// - event: TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)
// handler: handleTransferSingle
// - event: TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])
// handler: handleTransferBatch


export function handleTransferSingle(event: TransferSingle): void {
  let operator = event.params.operator
  let tokenId = event.params.id
  let from = event.params.from
  let to = event.params.to
  let value = event.params.value
  // 3 Cases
  // Mint, Burn, Transfer
  if (tokenId != One) {
    log.info('unexpected tokenId: {}', [tokenId.toString()]);
    return;
  }
  if (from.toHexString() != ZERO_ADDRESS) {
    let fromUser = getUser(from)
    decrementTicketCount(fromUser, value)
  }
  if (to.toHexString() != ZERO_ADDRESS) {
    let toUser = getUser(to)
    incrementTicketCount(toUser, value)
  }
}
export function handleTransferBatch(event: TransferBatch): void {
  let operator = event.params.operator
  let tokenIds = event.params.ids
  let from = event.params.from
  let to = event.params.to
  let values = event.params.values

  for (let i = 0; i < values.length; i++) {
    let tokenId = tokenIds[i];
    let value = values[i];
    if (tokenId == One) {
      // Only count for the first tokenId
      if (from.toHexString() != ZERO_ADDRESS) {
        let fromUser = getUser(from)
        decrementTicketCount(fromUser, value)
      }
      if (to.toHexString() != ZERO_ADDRESS) {
        let toUser = getUser(to)
        incrementTicketCount(toUser, value)
      }
    }
  }
}
