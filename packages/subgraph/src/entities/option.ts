import { Option } from "../../generated/schema";
import {Address, BigDecimal, BigInt, Bytes, log} from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/ShrubExchange/ERC20";
import {OrderAnnounceCommonStruct} from "../../generated/ShrubExchange/ShrubExchange";
import {weiToEth} from "../utils"
import {getToken} from "./token";
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
    option.save();
  }
  return option as Option;
}

export function setOptionOnMatch(positionHash: Bytes, size: BigDecimal, pricePerContract: BigDecimal): void {
  let option = Option.load(positionHash.toHex());
  if (option !== null) {
    option.lastPrice = pricePerContract;
    option.openInterest = option.openInterest.plus(size);
    option.save();
  }
}
