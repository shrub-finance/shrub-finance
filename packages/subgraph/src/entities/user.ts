import { User } from '../../generated/schema'
import {Address} from "@graphprotocol/graph-ts";

export function createUser(address: Address): User {
  let user = new User(address.toHex())
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
