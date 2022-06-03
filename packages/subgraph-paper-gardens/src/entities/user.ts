import { User } from '../../generated/schema'
import { Address, BigInt, log } from '@graphprotocol/graph-ts'

let Zero = BigInt.fromI32(0);
let One = BigInt.fromI32(1);

export function createUser(address: Address): User {
  let user = new User(address.toHex());
  user.seedCount = Zero;
  user.ticketCount = Zero;
  user.potCount = Zero;
  user.waterCount = Zero;
  user.fertilizerCount = Zero
  user.save();
  return user;
}

export function getUser(address: Address): User {
  let user = User.load(address.toHex());

  // If no user, create one
  if (user === null) {
    user = createUser(address);
  }
  return user as User;
}

export function incrementCount(user: User): User {
  user.seedCount = user.seedCount.plus(One);
  user.save();
  return user;
}

export function decrementCount(user: User): User {
  user.seedCount = user.seedCount.minus(One);
  user.save();
  return user;
}

export function incrementTicketCount(user: User, amount: BigInt): User {
  user.ticketCount = user.ticketCount.plus(amount);
  user.save();
  return user;
}

export function decrementTicketCount(user: User, amount: BigInt): User {
  user.ticketCount = user.ticketCount.minus(amount);
  user.save();
  return user;
}

// Pots
export function incrementPotCount(user: User, amount: BigInt): User {
  log.info("running incrementPotCount",[]);
  log.info("amount: {}", [amount.toString()])
  log.info("user.id: {}", [user.id])
  log.info("potCount: {}, amount: {}", [user.potCount.toString(), amount.toString()])
  user.potCount = user.potCount.plus(amount);
  user.save();
  return user;
}

export function decrementPotCount(user: User, amount: BigInt): User {
  user.potCount = user.potCount.minus(amount);
  user.save();
  return user;
}

// Water
export function incrementWaterCount(user: User, amount: BigInt): User {
  user.waterCount = user.waterCount.plus(amount);
  user.save();
  return user;
}

export function decrementWaterCount(user: User, amount: BigInt): User {
  user.waterCount = user.waterCount.minus(amount);
  user.save();
  return user;
}

// Fertilizer
export function incrementFertilizerCount(user: User, amount: BigInt): User {
  user.fertilizerCount = user.fertilizerCount.plus(amount);
  user.save();
  return user;
}

export function decrementFertilizerCount(user: User, amount: BigInt): User {
  user.fertilizerCount = user.fertilizerCount.minus(amount);
  user.save();
  return user;
}
