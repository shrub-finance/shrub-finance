import { TypeStat } from '../../generated/schema'
import { Address, log } from '@graphprotocol/graph-ts'

export function isBurnAddress(address: Address): boolean {
  log.info("isBurnAddress: {}", [address.toHex()]);
  return (
    address.toHex() == '0x0000000000000000000000000000000000000000' ||
    address.toHex() == '0x000000000000000000000000000000000000dead'
  )
}

export function isTreasuryAddress(address: Address): boolean {
  return (
    address.toHex() == '0xbcfe78a91b6968322ed1b08fbe3a081353487910'
  )
}

export function getTypeStat(type: string): TypeStat {
  let typestat = TypeStat.load(type);

  // If no typestat, create one
  if (typestat === null) {
    typestat = createTypeStat(type);
  }
  return typestat as TypeStat;
}

export function createTypeStat(type: string): TypeStat {
  let typestat = new TypeStat(type);
  typestat.claimed = 0;
  typestat.unmoved = 0;
  typestat.virgin = 0;
  typestat.burned = 0;
  typestat.treasury = 0;
  typestat.circulation = 0;
  typestat.planted = 0;
  typestat.harvested = 0;
  typestat.save();
  return typestat;
}

export function recordBurn(type: string): TypeStat {
  let typestat = getTypeStat(type);
  typestat.burned++;
  typestat.circulation--;
  typestat.save();
  return typestat;
}

export function recordToTreasury(type: string): TypeStat {
  let typestat = getTypeStat(type);
  typestat.treasury++;
  typestat.circulation--;
  typestat.save();
  return typestat;
}

export function recordFromTreasury(type: string): TypeStat {
  let typestat = getTypeStat(type);
  typestat.treasury--;
  typestat.circulation++;
  typestat.save();
  return typestat;
}

export function recordPlant(type: string): TypeStat {
  // Planting will already have a burn occurring - so we don't need to deal with that
  let typestat = getTypeStat(type);
  typestat.planted++;
  typestat.save();
  return typestat;
}

export function recordHarvest(type: string): TypeStat {
  let typestat = getTypeStat(type);
  typestat.harvested++;
  typestat.save();
  return typestat;
}

export function recordClaim(type: string, account: Address): TypeStat {
  let typestat = getTypeStat(type);
  typestat.claimed++;
  typestat.unmoved++;
  typestat.virgin++;
  if (isTreasuryAddress(account)) {
    typestat.treasury++;
  } else {
    typestat.circulation++;
  }
  typestat.save();
  return typestat;
}
