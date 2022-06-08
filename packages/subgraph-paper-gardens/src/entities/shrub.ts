import { PottedPlant, Seed, ShrubNFT } from '../../generated/schema'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { addPottedPlant, getSeed } from './seed'
import { getUser } from './user'
import { getTypeStat, recordClaim } from './typestats'
import { addShrubNft, getPottedPlant } from './potted-plant'

// let account = event.params.account
// let pottedPlantTokenId = event.params.pottedPlantTokenId
// let shrubTokenId = event.params.shrubTokenId
// let block = event.block;
export function createShrub(tokenId: BigInt, pottedPlantTokenId: BigInt, owner: Address, block: ethereum.Block): ShrubNFT {
  // id: ID!
  // owner: User!
  // name: String!
  // pottedPlant: PottedPlant!
  // born: Int!
  // bornBlock: Int!
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
