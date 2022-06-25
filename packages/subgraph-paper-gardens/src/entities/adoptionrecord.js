"use strict";
exports.__esModule = true;
exports.createAdoptionRecord = void 0;
var graph_ts_1 = require("@graphprotocol/graph-ts");
// import { recordClaim } from './typestats'
// import { getName, getType } from './seed'
//
function createAdoptionRecord(tokenId, owner) {
  var id = tokenId.toString();
  var seed = Seed.load(id);
  if (seed !== null) {
    throw new Error(
      "Seed with tokenId ".concat(tokenId.toString(), " already exists")
    );
  }
  seed = new Seed(id);
  seed.owner = owner.toHex();
  seed.type = getType(tokenId);
  seed.name = getName(tokenId);
  seed.dna = tokenId.mod(graph_ts_1.BigInt.fromI32(100));
  seed.unmoved = true;
  seed.virgin = true;
  recordClaim(seed.type);
  seed.save();
  return seed;
}
exports.createAdoptionRecord = createAdoptionRecord;
