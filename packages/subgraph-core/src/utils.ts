import {BigDecimal, BigInt} from "@graphprotocol/graph-ts/index";

export function weiToEth(amount: BigInt): BigDecimal {
  let res = amount.divDecimal(BigDecimal.fromString('1e18'));
  return res;
}
