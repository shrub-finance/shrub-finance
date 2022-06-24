"use strict";
exports.__esModule = true;
exports.addPottedPlant =
  exports.getSeed =
  exports.updateOwner =
  exports.createSeed =
  exports.getName =
  exports.getType =
    void 0;
var schema_1 = require("../../generated/schema");
var graph_ts_1 = require("@graphprotocol/graph-ts");
var user_1 = require("./user");
var typestats_1 = require("./typestats");
var CLAIM_RESERVE_START = graph_ts_1.BigInt.fromI32(24288221);
var CLAIM_RESERVE_END = graph_ts_1.BigInt.fromI32(24316483);
function getType(tokenId) {
  if (
    tokenId.ge(graph_ts_1.BigInt.fromI32(1111)) &&
    tokenId.le(graph_ts_1.BigInt.fromI32(10000))
  ) {
    return "Wonder";
  } else if (tokenId.ge(graph_ts_1.BigInt.fromI32(111))) {
    return "Passion";
  } else if (tokenId.ge(graph_ts_1.BigInt.fromI32(11))) {
    return "Hope";
  } else if (tokenId.ge(graph_ts_1.BigInt.fromI32(1))) {
    return "Power";
  } else {
    throw new Error("tokenId ".concat(tokenId.toString(), " out of range"));
  }
}
exports.getType = getType;
function getName(tokenId) {
  if (
    tokenId.ge(graph_ts_1.BigInt.fromI32(1111)) &&
    tokenId.le(graph_ts_1.BigInt.fromI32(10000))
  ) {
    return (
      "Paper Seed of Wonder #" +
      tokenId.minus(graph_ts_1.BigInt.fromI32(1110)).toString()
    );
  } else if (tokenId.ge(graph_ts_1.BigInt.fromI32(111))) {
    return (
      "Paper Seed of Passion #" +
      tokenId.minus(graph_ts_1.BigInt.fromI32(110)).toString()
    );
  } else if (tokenId.ge(graph_ts_1.BigInt.fromI32(11))) {
    return (
      "Paper Seed of Hope #" +
      tokenId.minus(graph_ts_1.BigInt.fromI32(10)).toString()
    );
  } else if (tokenId.ge(graph_ts_1.BigInt.fromI32(1))) {
    return "Paper Seed of Power #" + tokenId.toString();
  } else {
    throw new Error("tokenId ".concat(tokenId.toString(), " out of range"));
  }
}
exports.getName = getName;
function createSeed(tokenId, owner, block) {
  var id = tokenId.toString();
  var seed = schema_1.Seed.load(id);
  if (seed !== null) {
    throw new Error(
      "Seed with tokenId ".concat(tokenId.toString(), " already exists")
    );
  }
  var emotion =
    block.number.ge(CLAIM_RESERVE_START) && block.number.le(CLAIM_RESERVE_END)
      ? "sad"
      : "happy";
  seed = new schema_1.Seed(id);
  seed.owner = owner.toHex();
  seed.type = getType(tokenId);
  seed.name = getName(tokenId);
  seed.dna = tokenId.toI32() % 100;
  seed.born = block.timestamp.toI32();
  seed.bornBlock = block.number.toI32();
  seed.emotion = emotion;
  seed.unmoved = true;
  seed.virgin = true;
  (0, typestats_1.recordClaim)(seed.type);
  seed.save();
  return seed;
}
exports.createSeed = createSeed;
function updateOwner(tokenId, newOwner) {
  var id = tokenId.toString();
  var seed = schema_1.Seed.load(id);
  if (seed == null) {
    throw new Error(
      "Seed with tokenId ".concat(tokenId.toString(), " doesn't exist")
    );
  }
  var newOwnerUser = (0, user_1.getUser)(newOwner);
  var typestat = (0, typestats_1.getTypeStat)(seed.type);
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
  return seed;
}
exports.updateOwner = updateOwner;
function getSeed(tokenId) {
  var id = tokenId.toString();
  var seed = schema_1.Seed.load(id);
  if (seed === null) {
    throw new Error(
      "Seed with tokenId ".concat(tokenId.toString(), " not found")
    );
  }
  return seed;
}
exports.getSeed = getSeed;
function addPottedPlant(seed, pottedPlant) {
  seed.pottedPlant = pottedPlant.id;
  seed.save();
  return seed;
}
exports.addPottedPlant = addPottedPlant;
