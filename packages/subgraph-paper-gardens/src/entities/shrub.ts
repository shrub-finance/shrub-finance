import { PottedPlant, ShrubNFT } from '../../generated/schema'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { getSeedFromString } from './seed'
import { recordHarvest } from './typestats'
import { addShrubNft, getPottedPlant } from './potted-plant'

export function createShrub(tokenId: BigInt, pottedPlantTokenId: BigInt, owner: Address, block: ethereum.Block): ShrubNFT {
  let id = tokenId.toString();
  let shrubNft = ShrubNFT.load(id);
  if (shrubNft !== null) {
    throw new Error(`ShrubNFT with tokenId ${tokenId.toString()} already exists`);
  }
  let pottedPlant = getPottedPlant(pottedPlantTokenId);
  shrubNft = new ShrubNFT(id);
  shrubNft.owner = owner.toHex();
  shrubNft.pottedPlant = pottedPlant.id;
  shrubNft.born = block.timestamp.toI32();
  shrubNft.bornBlock = block.number.toI32();
  shrubNft.name = "";

  addShrubNft(pottedPlant as PottedPlant, shrubNft as ShrubNFT);
  shrubNft.save();
  let seed = getSeedFromString(pottedPlant.seed);
  recordHarvest(seed.type);
  return shrubNft as ShrubNFT;
}

export function updateShrubUri(tokenId: BigInt, uri: string): ShrubNFT {
  let shrubNft = getShrubNft(tokenId);
  shrubNft.uri = uri;
  shrubNft.save();
  return shrubNft as ShrubNFT;
}

export function getShrubNft(tokenId: BigInt): ShrubNFT {
  let id = tokenId.toString();
  let shrubNft = ShrubNFT.load(id);
  if (shrubNft === null) {
    throw new Error(`ShrubNFT with tokenId ${tokenId.toString()} not found`);
  }
  return shrubNft as ShrubNFT;
}
