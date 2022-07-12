import { PottedPlant, Seed, ShrubNFT } from '../../generated/schema'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { addPottedPlant, getSeed } from './seed'
import { recordPlant } from './typestats'

export function createPottedPlant(tokenId: BigInt, seedTokenId: BigInt, owner: Address, block: ethereum.Block): PottedPlant {
  let id = tokenId.toString();
  let pottedPlant = PottedPlant.load(id);
  if (pottedPlant !== null) {
    throw new Error(`PottedPlant with tokenId ${tokenId.toString()} already exists`);
  }
  let seed = getSeed(seedTokenId);
  pottedPlant = new PottedPlant(id);
  pottedPlant.owner = owner.toHex();
  pottedPlant.seed = seed.id;
  pottedPlant.born = block.timestamp.toI32();
  pottedPlant.bornBlock = block.number.toI32();
  pottedPlant.growth = 0;
  pottedPlant.lastWatering = 1;
  pottedPlant.uri = '';

  // Assign the pottedPlant to the seed to establish the 1:1 connection
  addPottedPlant(seed, pottedPlant as PottedPlant);
  pottedPlant.save();
  recordPlant(seed.type);
  return pottedPlant as PottedPlant;
}

export function getPottedPlant(tokenId: BigInt): PottedPlant {
  let id = tokenId.toString();
  let pottedPlant = PottedPlant.load(id);
  if (pottedPlant === null) {
    throw new Error(`PottedPlant with tokenId ${tokenId.toString()} not found`);
  }
  return pottedPlant as PottedPlant;
}

export function growPottedPlant(tokenId: BigInt, growthBps: i32, block: ethereum.Block): PottedPlant {
  let pottedPlant = getPottedPlant(tokenId);
  pottedPlant.growth = growthBps;
  pottedPlant.lastWatering = block.timestamp.toI32();
  pottedPlant.save();
  return pottedPlant as PottedPlant;
}

export function updatePottedPlantUri(tokenId: BigInt, uri: string): PottedPlant {
  let pottedPlant = getPottedPlant(tokenId);
  pottedPlant.uri = uri;
  pottedPlant.save();
  return pottedPlant as PottedPlant;
}

export function addShrubNft(pottedPlant: PottedPlant, shrubNft: ShrubNFT): PottedPlant {
  pottedPlant.shrubNft = shrubNft.id;
  pottedPlant.save();
  return pottedPlant as PottedPlant;
}

export function changePottedPlantOwner(tokenId: BigInt, owner: Address): PottedPlant {
  let pottedPlant = getPottedPlant(tokenId);
  pottedPlant.owner = owner.toHex();
  pottedPlant.save();
  return pottedPlant as PottedPlant;
}
