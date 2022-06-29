"use strict";
exports.__esModule = true;
exports.handleTransferBatch = exports.handleTransferSingle = void 0;
var graph_ts_1 = require("@graphprotocol/graph-ts");
var subgraph_toolkit_1 = require("@protofire/subgraph-toolkit");
var user_1 = require("./entities/user");
var One = graph_ts_1.BigInt.fromI32(1);
// - event: TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)
// handler: handleTransferSingle
// - event: TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])
// handler: handleTransferBatch
function handleTransferSingle(event) {
  var operator = event.params.operator;
  var tokenId = event.params.id;
  var from = event.params.from;
  var to = event.params.to;
  var value = event.params.value;
  // 3 Cases
  // Mint, Burn, Transfer
  if (tokenId != One) {
    graph_ts_1.log.info("unexpected tokenId: {}", [tokenId.toString()]);
    return;
  }
  if (from.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
    var fromUser = (0, user_1.getUser)(from);
    (0, user_1.decrementTicketCount)(fromUser, value);
  }
  if (to.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
    var toUser = (0, user_1.getUser)(to);
    (0, user_1.incrementTicketCount)(toUser, value);
  }
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
    if (tokenId == One) {
      // Only count for the first tokenId
      if (from.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
        var fromUser = (0, user_1.getUser)(from);
        (0, user_1.decrementTicketCount)(fromUser, value);
      }
      if (to.toHexString() != subgraph_toolkit_1.ZERO_ADDRESS) {
        var toUser = (0, user_1.getUser)(to);
        (0, user_1.incrementTicketCount)(toUser, value);
      }
    }
  }
}
exports.handleTransferBatch = handleTransferBatch;
