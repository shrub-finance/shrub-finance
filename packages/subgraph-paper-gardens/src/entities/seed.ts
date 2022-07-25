import { PottedPlant, Seed } from '../../generated/schema'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { getUser } from './user'
import { getTypeStat, recordClaim } from './typestats'
let CLAIM_RESERVE_START = BigInt.fromI32(24288221);
let CLAIM_RESERVE_END = BigInt.fromI32(24316483);

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

export function getName(tokenId: BigInt): string {
  if (tokenId.ge(BigInt.fromI32(1111)) && tokenId.le(BigInt.fromI32(10000))) {
    return 'Paper Seed of Wonder #' + (tokenId).minus(BigInt.fromI32(1110)).toString();
  } else if (tokenId.ge(BigInt.fromI32(111))) {
    return 'Paper Seed of Passion #' + (tokenId).minus(BigInt.fromI32(110)).toString();
  } else if (tokenId.ge(BigInt.fromI32(11))) {
    return 'Paper Seed of Hope #' + (tokenId).minus(BigInt.fromI32(10)).toString();
  } else if (tokenId.ge(BigInt.fromI32(1))) {
    return 'Paper Seed of Power #' + (tokenId).toString();
  } else {
    throw new Error(`tokenId ${tokenId.toString()} out of range`);
  }
}

export function createSeed(tokenId: BigInt, owner: Address, block: ethereum.Block): Seed {
  let id = tokenId.toString();
  let seed = Seed.load(id);
  if (seed !== null) {
    throw new Error(`Seed with tokenId ${tokenId.toString()} already exists`);
  }
  let emotion = block.number.ge(CLAIM_RESERVE_START) && block.number.le(CLAIM_RESERVE_END) ? 'sad' : 'happy';
  // For testing sad seeds
  // let emotion =tokenId.equals(BigInt.fromI32(16))
  //   || tokenId.equals(BigInt.fromI32(250))
  //   || tokenId.equals(BigInt.fromI32(2181))
  //   || tokenId.equals(BigInt.fromI32(2188)) ? 'sad' : 'happy';
  seed = new Seed(id);
  seed.owner = owner.toHex();
  seed.type = getType(tokenId);
  seed.name = getName(tokenId);
  seed.dna = tokenId.toI32() % 100;
  seed.born = block.timestamp.toI32();
  seed.bornBlock = block.number.toI32();
  seed.emotion = emotion;
  seed.unmoved = true;
  seed.virgin = true;
  recordClaim(seed.type, owner);
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
  return getSeedFromString(id);
}

export function getSeedFromString(tokenIdString: string): Seed {
  let seed = Seed.load(tokenIdString);
  if (seed === null) {
    throw new Error(`Seed with tokenId ${tokenIdString} not found`);
  }
  return seed as Seed;
}

export function addPottedPlant(seed: Seed, pottedPlant: PottedPlant): Seed {
  seed.pottedPlant = pottedPlant.id;
  seed.save();
  return seed as Seed;
}

export function updateEmotion(seed: Seed, emotion: string): Seed {
  seed.emotion = emotion;
  seed.save();
  return seed as Seed;
}
