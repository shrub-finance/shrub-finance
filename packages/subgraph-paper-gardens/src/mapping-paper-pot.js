"use strict";
exports.__esModule = true;
exports.handleHarvest =
  exports.handlePlant =
  exports.handleGrow =
  exports.handleTransferBatch =
  exports.handleTransferSingle =
    void 0;
var graph_ts_1 = require("@graphprotocol/graph-ts");
var subgraph_toolkit_1 = require("@protofire/subgraph-toolkit");
var user_1 = require("./entities/user");
var potted_plant_1 = require("./entities/potted-plant");
var shrub_1 = require("./entities/shrub");
var One = graph_ts_1.BigInt.fromI32(1);
var Two = graph_ts_1.BigInt.fromI32(2);
var Three = graph_ts_1.BigInt.fromI32(3);
var OneMillion = graph_ts_1.BigInt.fromI32(1000000);
var TwoMillion = graph_ts_1.BigInt.fromI32(2000000);
var ThreeMillion = graph_ts_1.BigInt.fromI32(3000000);
function transfer(tokenId, from, to, value) {
  var fromUser;
  var toUser;
  if (from.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
    fromUser = (0, user_1.getUser)(from);
  }
  if (to.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
    toUser = (0, user_1.getUser)(to);
  }
  graph_ts_1.log.info("tokenId: {}, from: {}, to: {}, value: {}", [
    tokenId.toString(),
    from.toHexString(),
    to.toHexString(),
    value.toString(),
  ]);
  if (tokenId == One) {
    graph_ts_1.log.info("its a pot", []);
    // Case: Pot
    if (from.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
      graph_ts_1.log.info("decrementing", []);
      (0, user_1.decrementPotCount)(fromUser, value);
    }
    if (to.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
      graph_ts_1.log.info("incrementing", []);
      (0, user_1.incrementPotCount)(toUser, value);
    }
  } else if (tokenId == Two) {
    // Case: Fertilizer
    if (from.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
      (0, user_1.decrementFertilizerCount)(fromUser, value);
    }
    if (to.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
      (0, user_1.incrementFertilizerCount)(toUser, value);
    }
  } else if (tokenId == Three) {
    // Case: Water
    if (from.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
      (0, user_1.decrementWaterCount)(fromUser, value);
    }
    if (to.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
      (0, user_1.incrementWaterCount)(toUser, value);
    }
  } else if (tokenId >= OneMillion) {
    // Case: Potted Plant
    if (from.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
      // skip the minting case and will be handled by the Plant event
      (0, potted_plant_1.changePottedPlantOwner)(tokenId, to);
    }
    // if (to.toHexString() == ZERO_ADDRESS) {
    //   // TODO: This is the burning case, and we need to figure out how to deal with harvesting - likely needs another special
    // }
  } else if (tokenId >= TwoMillion && tokenId < ThreeMillion) {
    // Case: Shrub
  } else {
    // This shouldn't happen
    graph_ts_1.log.error("unexpected tokenId: {}", [tokenId.toString()]);
  }
}
function handleTransferSingle(event) {
  var operator = event.params.operator;
  var tokenId = event.params.id;
  var from = event.params.from;
  var to = event.params.to;
  var value = event.params.value;
  transfer(tokenId, from, to, value);
}
exports.handleTransferSingle = handleTransferSingle;
function handleTransferBatch(event) {
  var operator = event.params.operator;
  var tokenIds = event.params.ids;
  var from = event.params.from;
  var to = event.params.to;
  var values = event.params.values;
  for (var i = 0; i < values.length; i++) {
    var tokenId = tokenIds[i];
    var value = values[i];
    transfer(tokenId, from, to, value);
  }
}
exports.handleTransferBatch = handleTransferBatch;
function handleGrow(event) {
  var tokenId = event.params.tokenId;
  var growthBps = event.params.growthBps;
  var growthAmount = event.params.growthAmount;
  var block = event.block;
  (0, potted_plant_1.growPottedPlant)(tokenId, growthBps, block);
}
exports.handleGrow = handleGrow;
function handlePlant(event) {
  var seedTokenId = event.params.seedTokenId;
  var tokenId = event.params.tokenId;
  var account = event.params.account;
  var block = event.block;
  (0, potted_plant_1.createPottedPlant)(tokenId, seedTokenId, account, block);
}
exports.handlePlant = handlePlant;
function handleHarvest(event) {
  var account = event.params.account;
  var pottedPlantTokenId = event.params.pottedPlantTokenId;
  var shrubTokenId = event.params.shrubTokenId;
  var block = event.block;
  (0, shrub_1.createShrub)(shrubTokenId, pottedPlantTokenId, account, block);
}
exports.handleHarvest = handleHarvest;
