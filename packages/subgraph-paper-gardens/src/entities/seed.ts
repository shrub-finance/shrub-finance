import { Seed } from '../../generated/schema'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { getUser } from './user'
import { getTypeStat, recordClaim } from './typestats'

export function getType(tokenId: BigInt): string {
  if (tokenId.ge(BigInt.fromI32(1111)) && tokenId.le(BigInt.fromI32(10000))) {
    return 'Wonder';
  } else if (tokenId.ge(BigInt.fromI32(111))) {
    return 'Passion';
  } else if (tokenId.ge(BigInt.fromI32(11))) {
    return 'Hope';
  } else if (tokenId.ge(BigInt.fromI32(1))) {
    return 'Power';
  } else {
    throw new Error(`tokenId ${tokenId.toString()} out of range`);
  }
}

export function createSeed(tokenId: BigInt, owner: Address): Seed {
  let id = tokenId.toString();
  let seed = Seed.load(id);
  if (seed !== null) {
    throw new Error(`Seed with tokenId ${tokenId.toString()} already exists`);
  }
  seed = new Seed(id);
  seed.owner = owner.toHex();
  seed.type = getType(tokenId);
  seed.unmoved = true;
  seed.virgin = true;
  recordClaim(seed.type);
  seed.save();
  return seed as Seed;
}

export function updateOwner(tokenId: BigInt, newOwner: Address): Seed {
  let id = tokenId.toString();
  let seed = Seed.load(id);
  if (seed == null) {
    throw new Error(`Seed with tokenId ${tokenId.toString()} doesn't exist`);
  }
  let newOwnerUser = getUser(newOwner);
  let typestat = getTypeStat(seed.type);
  if (seed.virgin) {
    typestat.virgin--;
  }
  if (seed.unmoved) {
    typestat.unmoved--;
  }
  typestat.save();
  seed.owner = newOwnerUser.id;
  seed.virgin = false;
  seed.unmoved = false;
  seed.save();
  return seed as Seed;
}

export function getSeed(tokenId: BigInt): Seed {
  let id = tokenId.toString();
  let seed = Seed.load(id);
  if (seed === null) {
    throw new Error(`Seed with tokenId ${tokenId.toString()} not found`);
  }
  return seed as Seed;
}
