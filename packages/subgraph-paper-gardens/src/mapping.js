"use strict";
// - event: Transfer(address,address,uint256)
// handler: handleTransfer
// - event: Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
// handler: handleApproval
// - event: ApprovalForAll(address indexed owner, address indexed operator, bool approved)
// handler: handleApprovalForAll
// - event: OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
// handler: handleOwnershipTransferred
// - event: Claimed(uint256,address,uint256)
// handler: handleClaim
exports.__esModule = true;
exports.handleClaim =
  exports.handleOwnershipTransferred =
  exports.handleApprovalForAll =
  exports.handleApproval =
  exports.handleTransfer =
    void 0;
var user_1 = require("./entities/user");
var seed_1 = require("./entities/seed");
var graph_ts_1 = require("@graphprotocol/graph-ts");
var subgraph_toolkit_1 = require("@protofire/subgraph-toolkit");
function handleTransfer(event) {
  var from = event.params.from;
  var to = event.params.to;
  var tokenId = event.params.tokenId;
  // log.info("from: {}",[from.toHexString()]);
  if (from.toHexString() == subgraph_toolkit_1.ZERO_ADDRESS) {
    // This is a mint
    return;
  }
  var toUser = (0, user_1.getUser)(to);
  var fromUser = (0, user_1.getUser)(from);
  (0, user_1.decrementCount)(fromUser);
  (0, user_1.incrementCount)(toUser);
  (0, seed_1.updateOwner)(tokenId, graph_ts_1.Address.fromString(toUser.id));
}
exports.handleTransfer = handleTransfer;
function handleApproval(event) {}
exports.handleApproval = handleApproval;
function handleApprovalForAll(event) {}
exports.handleApprovalForAll = handleApprovalForAll;
function handleOwnershipTransferred(event) {}
exports.handleOwnershipTransferred = handleOwnershipTransferred;
function handleClaim(event) {
  var userAddress = event.params.account;
  var tokenId = event.params.amount;
  var block = event.block;
  var user = (0, user_1.getUser)(userAddress);
  (0, user_1.incrementCount)(user);
  (0, seed_1.createSeed)(
    tokenId,
    graph_ts_1.Address.fromString(user.id),
    block
  );
}
exports.handleClaim = handleClaim;
