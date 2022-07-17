import { BigInt } from '@graphprotocol/graph-ts'
import {
  updateLastClaim,
} from './entities/potted-plant'
import { Claim } from '../generated/WaterFaucet/WaterFaucet'


export function handleClaim(event: Claim): void {
  let tokenIds = event.params.tokenIds
  let account = event.params.account
  let block = event.block
  for (let i = 0; i < tokenIds.length; i++) {
    updateLastClaim(BigInt.fromI32(tokenIds[i]), block);
  }
}
