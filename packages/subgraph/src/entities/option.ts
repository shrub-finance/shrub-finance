import { Option } from "../../generated/schema";
import { Address, BigDecimal, BigInt, Bytes, log, Value } from '@graphprotocol/graph-ts'
import {
  OrderAnnounceCommonStruct,
} from '../../generated/ShrubExchange/ShrubExchange'
import { decimal } from '@protofire/subgraph-toolkit/index'

const STRIKE_BASE_SHIFT_DECIMALS = 6;

export function getOption(positionHash: Bytes, common: OrderAnnounceCommonStruct): Option {
  let option = Option.load(positionHash.toHex());
  if (option === null) {
    option = new Option(positionHash.toHex());
    let optionType = common.optionType == 0 ? 'PUT' : 'CALL';
    // let expiryDate = new Date(common.expiry.toI32() * 1000);
    // let formattedExpiry = expiryDate.toLocaleDateString('en-us', {month: "short", day: "numeric"});
    // return `${optionAction} ${formattedSize}x${optionType}${formattedExpiry}$${formattedStrike}`
    // option.name = optionType + formattedExpiry + "$" + weiToEth(common.strike).toString()
    option.baseAsset = common.baseAsset.toHex();
    option.quoteAsset = common.quoteAsset.toHex();
    option.expiry = common.expiry.toI32();
    option.strike = decimal.fromBigInt(common.strike, STRIKE_BASE_SHIFT_DECIMALS);
    // option.strike = weiToEth(common.strike);
    option.optionType = optionType;
    option.openInterest = decimal.ZERO;
    option.positionPoolBalance = decimal.ZERO;
    option.positionPoolQuoteAssetBalance = decimal.ZERO;
    option.positionPoolBaseAssetBalance = decimal.ZERO;
    option.save();
  }
  return option as Option;
}

// export function getPositionHash(option: Option, shrubAddress: Address): Bytes {
//   let shrubExchange = ShrubExchange.bind(shrubAddress);
//   // get baseAsset(): Address {
//   //   return this[0].toAddress();
//   // }
//   //
//   // get quoteAsset(): Address {
//   //   return this[1].toAddress();
//   // }
//   //
//   // get expiry(): BigInt {
//   //   return this[2].toBigInt();
//   // }
//   //
//   // get strike(): BigInt {
//   //   return this[3].toBigInt();
//   // }
//   //
//   // get optionType(): i32 {
//   //   return this[4].toI32();
//   // }
//   let baseAsset = Value.fromString(option.baseAsset);
//   let quoteAsset = Value.fromString(option.quoteAsset);
//   let expiry = Value.fromI32(option.expiry);
//   let strike = Value.from
//   let commonStruct = new ShrubExchange__hashOrderCommonInputCommonStruct([Value.fromString(option.baseAsset), option.quoteAsset, option.expiry, option.strike, option.optionType])
//   shrubExchange.hashOrderCommon(commonStruct)
// }

export function setOptionOnMatch(positionHash: Bytes, size: BigDecimal, pricePerContract: BigDecimal): void {
  let option = Option.load(positionHash.toHex());
  if (option !== null) {
    option.lastPrice = pricePerContract;
    option.openInterest = option.openInterest.plus(size);
    option.save();
  }
}
