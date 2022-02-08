import { Address, BigInt } from '@graphprotocol/graph-ts'
import { AdoptionRecord } from '../../generated/schema'
// import { recordClaim } from './typestats'
// import { getName, getType } from './seed'
//
export function createAdoptionRecord(tokenId: BigInt, owner: Address): AdoptionRecord {
  let id = tokenId.toString();
  let seed = Seed.load(id);
  if (seed !== null) {
    throw new Error(`Seed with tokenId ${tokenId.toString()} already exists`);
  }
  seed = new Seed(id);
  seed.owner = owner.toHex();
  seed.type = getType(tokenId);
  seed.name = getName(tokenId);
  seed.dna = tokenId.mod(BigInt.fromI32(100));
  seed.unmoved = true;
  seed.virgin = true;
  recordClaim(seed.type);
  seed.save();
  return seed as Seed;
}
