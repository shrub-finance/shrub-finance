import { NewGravatar, UpdatedGravatar } from '../generated/Gravity/Gravity'
import { Deposit, Withdraw, OrderAnnounce, OrderMatched } from '../generated/ShrubExchange/ShrubExchange'
import { Gravatar, Order, User } from '../generated/schema'
import {BigInt, log} from '@graphprotocol/graph-ts'


export function handleDeposit(event: Deposit): void {
  let eventUser = event.params.user;
  let amount = event.params.amount;
  log.info('user: {} - amount: {}', [eventUser.toHex(), event.params.amount.toString()]);
  let user = User.load(eventUser.toHex());
  if (user === null) {
    user = new User(eventUser.toHex());
    user.balance = BigInt.fromI32(0);
  }
  user.balance = user.balance.plus(amount);
  user.save();
}

export function handleWithdraw(event: Withdraw): void {

}

export function handleOrderAnnounce(event: OrderAnnounce): void {

}

export function handleOrderMatched(event: OrderMatched): void {

}

export function handleNewGravatar(event: NewGravatar): void {
  let gravatar = new Gravatar(event.params.id.toHex())
  gravatar.owner = event.params.owner
  gravatar.displayName = event.params.displayName
  gravatar.imageUrl = event.params.imageUrl
  gravatar.save()
}

export function handleUpdatedGravatar(event: UpdatedGravatar): void {
  let id = event.params.id.toHex()
  let gravatar = Gravatar.load(id)
  if (gravatar == null) {
    gravatar = new Gravatar(id)
  }
  gravatar.owner = event.params.owner
  gravatar.displayName = event.params.displayName
  gravatar.imageUrl = event.params.imageUrl
  gravatar.save()
}
