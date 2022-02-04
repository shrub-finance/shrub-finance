import { TypeStat } from '../../generated/schema'

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
  typestat.save();
  return typestat;
}

export function recordClaim(type: string): TypeStat {
  let typestat = getTypeStat(type);
  typestat.claimed++;
  typestat.unmoved++;
  typestat.virgin++;
  typestat.save();
  return typestat;
}
