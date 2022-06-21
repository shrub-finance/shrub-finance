"use strict";
exports.__esModule = true;
exports.recordClaim = exports.createTypeStat = exports.getTypeStat = void 0;
var schema_1 = require("../../generated/schema");
function getTypeStat(type) {
  var typestat = schema_1.TypeStat.load(type);
  // If no typestat, create one
  if (typestat === null) {
    typestat = createTypeStat(type);
  }
  return typestat;
}
exports.getTypeStat = getTypeStat;
function createTypeStat(type) {
  var typestat = new schema_1.TypeStat(type);
  typestat.claimed = 0;
  typestat.unmoved = 0;
  typestat.virgin = 0;
  typestat.save();
  return typestat;
}
exports.createTypeStat = createTypeStat;
function recordClaim(type) {
  var typestat = getTypeStat(type);
  typestat.claimed++;
  typestat.unmoved++;
  typestat.virgin++;
  typestat.save();
  return typestat;
}
exports.recordClaim = recordClaim;
