"use strict";
exports.__esModule = true;
exports.changePottedPlantOwner =
  exports.addShrubNft =
  exports.growPottedPlant =
  exports.getPottedPlant =
  exports.createPottedPlant =
    void 0;
var schema_1 = require("../../generated/schema");
var graph_ts_1 = require("@graphprotocol/graph-ts");
var seed_1 = require("./seed");
var CLAIM_RESERVE_START = graph_ts_1.BigInt.fromI32(24288221);
var CLAIM_RESERVE_END = graph_ts_1.BigInt.fromI32(24316483);
// export function getType(tokenId: BigInt): string {
//   if (tokenId.ge(BigInt.fromI32(1111)) && tokenId.le(BigInt.fromI32(10000))) {
//     return 'Wonder';
//   } else if (tokenId.ge(BigInt.fromI32(111))) {
//     return 'Passion';
//   } else if (tokenId.ge(BigInt.fromI32(11))) {
//     return 'Hope';
//   } else if (tokenId.ge(BigInt.fromI32(1))) {
//     return 'Power';
//   } else {
//     throw new Error(`tokenId ${tokenId.toString()} out of range`);
//   }
// }
//
// export function getName(tokenId: BigInt): string {
//   if (tokenId.ge(BigInt.fromI32(1111)) && tokenId.le(BigInt.fromI32(10000))) {
//     return 'Paper Seed of Wonder #' + (tokenId).minus(BigInt.fromI32(1110)).toString();
//   } else if (tokenId.ge(BigInt.fromI32(111))) {
//     return 'Paper Seed of Passion #' + (tokenId).minus(BigInt.fromI32(110)).toString();
//   } else if (tokenId.ge(BigInt.fromI32(11))) {
//     return 'Paper Seed of Hope #' + (tokenId).minus(BigInt.fromI32(10)).toString();
//   } else if (tokenId.ge(BigInt.fromI32(1))) {
//     return 'Paper Seed of Power #' + (tokenId).toString();
//   } else {
//     throw new Error(`tokenId ${tokenId.toString()} out of range`);
//   }
// }
//
// export function createSeed(tokenId: BigInt, owner: Address, block: ethereum.Block): Seed {
//   let id = tokenId.toString();
//   let seed = Seed.load(id);
//   if (seed !== null) {
//     throw new Error(`Seed with tokenId ${tokenId.toString()} already exists`);
//   }
//   let emotion = block.number.ge(CLAIM_RESERVE_START) && block.number.le(CLAIM_RESERVE_END) ? 'sad' : 'happy';
//   seed = new Seed(id);
//   seed.owner = owner.toHex();
//   seed.type = getType(tokenId);
//   seed.name = getName(tokenId);
//   seed.dna = tokenId.toI32() % 100;
//   seed.born = block.timestamp.toI32();
//   seed.bornBlock = block.number.toI32();
//   seed.emotion = emotion;
//   seed.unmoved = true;
//   seed.virgin = true;
//   recordClaim(seed.type);
//   seed.save();
//   return seed as Seed;
// }
//
// export function updateOwner(tokenId: BigInt, newOwner: Address): Seed {
//   let id = tokenId.toString();
//   let seed = Seed.load(id);
//   if (seed == null) {
//     throw new Error(`Seed with tokenId ${tokenId.toString()} doesn't exist`);
//   }
//   let newOwnerUser = getUser(newOwner);
//   let typestat = getTypeStat(seed.type);
//   if (seed.virgin) {
//     typestat.virgin--;
//   }
//   if (seed.unmoved) {
//     typestat.unmoved--;
//   }
//   typestat.save();
//   seed.owner = newOwnerUser.id;
//   seed.virgin = false;
//   seed.unmoved = false;
//   seed.save();
//   return seed as Seed;
// }
//
// export function getSeed(tokenId: BigInt): Seed {
//   let id = tokenId.toString();
//   let seed = Seed.load(id);
//   if (seed === null) {
//     throw new Error(`Seed with tokenId ${tokenId.toString()} not found`);
//   }
//   return seed as Seed;
// }
function createPottedPlant(tokenId, seedTokenId, owner, block) {
  var id = tokenId.toString();
  var pottedPlant = schema_1.PottedPlant.load(id);
  if (pottedPlant !== null) {
    throw new Error(
      "PottedPlant with tokenId ".concat(tokenId.toString(), " already exists")
    );
  }
  var seed = (0, seed_1.getSeed)(seedTokenId);
  pottedPlant = new schema_1.PottedPlant(id);
  pottedPlant.owner = owner.toHex();
  pottedPlant.seed = seed.id;
  pottedPlant.born = block.timestamp.toI32();
  pottedPlant.bornBlock = block.number.toI32();
  pottedPlant.growth = 0;
  pottedPlant.lastWatering = 1;
  // Assign the pottedPlant to the seed to establish the 1:1 connection
  (0, seed_1.addPottedPlant)(seed, pottedPlant);
  pottedPlant.save();
  return pottedPlant;
}
exports.createPottedPlant = createPottedPlant;
function getPottedPlant(tokenId) {
  var id = tokenId.toString();
  var pottedPlant = schema_1.PottedPlant.load(id);
  if (pottedPlant === null) {
    throw new Error(
      "PottedPlant with tokenId ".concat(tokenId.toString(), " not found")
    );
  }
  return pottedPlant;
}
exports.getPottedPlant = getPottedPlant;
function growPottedPlant(tokenId, growthBps, block) {
  var pottedPlant = getPottedPlant(tokenId);
  pottedPlant.growth = growthBps;
  pottedPlant.lastWatering = block.timestamp.toI32();
  pottedPlant.save();
  return pottedPlant;
}
exports.growPottedPlant = growPottedPlant;
function addShrubNft(pottedPlant, shrubNft) {
  pottedPlant.shrubNft = shrubNft.id;
  pottedPlant.save();
  return pottedPlant;
}
exports.addShrubNft = addShrubNft;
function changePottedPlantOwner(tokenId, owner) {
  var pottedPlant = getPottedPlant(tokenId);
  pottedPlant.owner = owner.toHex();
  pottedPlant.save();
  return pottedPlant;
}
exports.changePottedPlantOwner = changePottedPlantOwner;
