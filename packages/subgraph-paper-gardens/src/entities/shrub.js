"use strict";
exports.__esModule = true;
exports.getShrubNft = exports.createShrub = void 0;
var schema_1 = require("../../generated/schema");
var potted_plant_1 = require("./potted-plant");
// let account = event.params.account
// let pottedPlantTokenId = event.params.pottedPlantTokenId
// let shrubTokenId = event.params.shrubTokenId
// let block = event.block;
function createShrub(tokenId, pottedPlantTokenId, owner, block) {
  // id: ID!
  // owner: User!
  // name: String!
  // pottedPlant: PottedPlant!
  // born: Int!
  // bornBlock: Int!
  var id = tokenId.toString();
  var shrubNft = schema_1.ShrubNFT.load(id);
  if (shrubNft !== null) {
    throw new Error(
      "ShrubNFT with tokenId ".concat(tokenId.toString(), " already exists")
    );
  }
  var pottedPlant = (0, potted_plant_1.getPottedPlant)(pottedPlantTokenId);
  shrubNft = new schema_1.ShrubNFT(id);
  shrubNft.owner = owner.toHex();
  shrubNft.pottedPlant = pottedPlant.id;
  shrubNft.born = block.timestamp.toI32();
  shrubNft.bornBlock = block.number.toI32();
  shrubNft.name = "";
  (0, potted_plant_1.addShrubNft)(pottedPlant, shrubNft);
  shrubNft.save();
  return shrubNft;
}
exports.createShrub = createShrub;
function getShrubNft(tokenId) {
  var id = tokenId.toString();
  var shrubNft = schema_1.ShrubNFT.load(id);
  if (shrubNft === null) {
    throw new Error(
      "ShrubNFT with tokenId ".concat(tokenId.toString(), " not found")
    );
  }
  return shrubNft;
}
exports.getShrubNft = getShrubNft;
