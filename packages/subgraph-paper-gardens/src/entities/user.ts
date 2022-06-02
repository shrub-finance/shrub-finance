import { User } from '../../generated/schema'
import { Address, BigInt } from '@graphprotocol/graph-ts'

let Zero = BigInt.fromI32(0);
let One = BigInt.fromI32(1);

export function createUser(address: Address): User {
  let user = new User(address.toHex());
  user.seedCount = Zero;
  user.ticketCount = Zero;
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
