import {Token} from "../../generated/schema";
import {Address, BigInt, log} from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/ShrubExchange/ERC20";
import { ADDRESS_ZERO } from '@protofire/subgraph-toolkit/index'

export function getToken(address: Address): Token {
  let token = Token.load(address.toHex());
  if (token === null) {
    token = new Token(address.toHex());
    token.symbol = getSymbol(address);
    token.name = getName(address);
    token.decimals = getDecimals(address);
    token.save();
  }
  return token as Token;
}

function getSymbol(address: Address): string {
  // hard-coded override
  if (address.toHex() == ADDRESS_ZERO) {
    return 'MATIC';
  }

  let erc20 = ERC20.bind(address);
  let symbolValue = 'unknown';
  let symbolResult = erc20.try_symbol();
  if (!symbolResult.reverted) {
    symbolValue = symbolResult.value.toString();
  }
  return symbolValue;
}

function getName(address: Address): string {
  // hard-coded override
  if (address.toHex() == ADDRESS_ZERO) {
    return 'Polygon';
  }
  let erc20 = ERC20.bind(address);
  let nameValue = 'unknown';
  let nameResult = erc20.try_name();
  if (!nameResult.reverted) {
    nameValue = nameResult.value.toString();
  }
  return nameValue;
}

function getDecimals(address: Address): i32 {
  // hard-coded override
  if (address.toHex() == ADDRESS_ZERO) {
    return 18 as i32;
  }
  let erc20 = ERC20.bind(address);
  let decimalValue = null;
  let decimalResult = erc20.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  // log.info('decimal result: {}', [BigInt.fromI32(decimalResult).toString()])
  return decimalValue as i32;
}
