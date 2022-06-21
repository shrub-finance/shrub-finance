"use strict";
exports.__esModule = true;
exports.decrementFertilizerCount =
  exports.incrementFertilizerCount =
  exports.decrementWaterCount =
  exports.incrementWaterCount =
  exports.decrementPotCount =
  exports.incrementPotCount =
  exports.decrementTicketCount =
  exports.incrementTicketCount =
  exports.decrementCount =
  exports.incrementCount =
  exports.getUser =
  exports.createUser =
    void 0;
var schema_1 = require("../../generated/schema");
var graph_ts_1 = require("@graphprotocol/graph-ts");
var Zero = graph_ts_1.BigInt.fromI32(0);
var One = graph_ts_1.BigInt.fromI32(1);
function createUser(address) {
  var user = new schema_1.User(address.toHex());
  user.seedCount = Zero;
  user.ticketCount = Zero;
  user.potCount = Zero;
  user.waterCount = Zero;
  user.fertilizerCount = Zero;
  user.save();
  return user;
}
exports.createUser = createUser;
function getUser(address) {
  var user = schema_1.User.load(address.toHex());
  // If no user, create one
  if (user === null) {
    user = createUser(address);
  }
  return user;
}
exports.getUser = getUser;
function incrementCount(user) {
  user.seedCount = user.seedCount.plus(One);
  user.save();
  return user;
}
exports.incrementCount = incrementCount;
function decrementCount(user) {
  user.seedCount = user.seedCount.minus(One);
  user.save();
  return user;
}
exports.decrementCount = decrementCount;
function incrementTicketCount(user, amount) {
  user.ticketCount = user.ticketCount.plus(amount);
  user.save();
  return user;
}
exports.incrementTicketCount = incrementTicketCount;
function decrementTicketCount(user, amount) {
  user.ticketCount = user.ticketCount.minus(amount);
  user.save();
  return user;
}
exports.decrementTicketCount = decrementTicketCount;
// Pots
function incrementPotCount(user, amount) {
  graph_ts_1.log.info("running incrementPotCount", []);
  graph_ts_1.log.info("amount: {}", [amount.toString()]);
  graph_ts_1.log.info("user.id: {}", [user.id]);
  graph_ts_1.log.info("potCount: {}, amount: {}", [
    user.potCount.toString(),
    amount.toString(),
  ]);
  user.potCount = user.potCount.plus(amount);
  user.save();
  return user;
}
exports.incrementPotCount = incrementPotCount;
function decrementPotCount(user, amount) {
  user.potCount = user.potCount.minus(amount);
  user.save();
  return user;
}
exports.decrementPotCount = decrementPotCount;
// Water
function incrementWaterCount(user, amount) {
  user.waterCount = user.waterCount.plus(amount);
  user.save();
  return user;
}
exports.incrementWaterCount = incrementWaterCount;
function decrementWaterCount(user, amount) {
  user.waterCount = user.waterCount.minus(amount);
  user.save();
  return user;
}
exports.decrementWaterCount = decrementWaterCount;
// Fertilizer
function incrementFertilizerCount(user, amount) {
  user.fertilizerCount = user.fertilizerCount.plus(amount);
  user.save();
  return user;
}
exports.incrementFertilizerCount = incrementFertilizerCount;
function decrementFertilizerCount(user, amount) {
  user.fertilizerCount = user.fertilizerCount.minus(amount);
  user.save();
  return user;
}
exports.decrementFertilizerCount = decrementFertilizerCount;
