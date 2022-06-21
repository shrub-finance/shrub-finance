"use strict";
exports.__esModule = true;
exports.handleDeliver =
  exports.handleRegister =
  exports.handleClearRegister =
  exports.handleRemove =
  exports.handleAdd =
    void 0;
var user_1 = require("./entities/user");
var seed_1 = require("./entities/seed");
var schema_1 = require("../generated/schema");
function handleAdd(event) {}
exports.handleAdd = handleAdd;
function handleRemove(event) {}
exports.handleRemove = handleRemove;
function handleClearRegister(event) {}
exports.handleClearRegister = handleClearRegister;
function handleRegister(event) {}
exports.handleRegister = handleRegister;
function handleDeliver(event) {
  var tokenId = event.params.tokenId;
  var user = event.params.user;
  var timestamp = event.block.timestamp.toI32();
  var block = event.block.number.toI32();
  var id = tokenId.toString() + "-" + timestamp.toString();
  var adoptionRecord = schema_1.AdoptionRecord.load(id);
  if (adoptionRecord !== null) {
    throw new Error("AdoptionRecord with id ".concat(id, " already exists"));
  }
  var userObj = (0, user_1.getUser)(user);
  var seedObj = (0, seed_1.getSeed)(tokenId);
  adoptionRecord = new schema_1.AdoptionRecord(id);
  adoptionRecord.seed = seedObj.id;
  adoptionRecord.user = userObj.id;
  adoptionRecord.block = block;
  adoptionRecord.timestamp = timestamp;
  adoptionRecord.save();
}
exports.handleDeliver = handleDeliver;
