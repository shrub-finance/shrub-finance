import { User, Option, UserOption } from '../../generated/schema'

export function createUserOption(user: User, option: Option): UserOption {
  let id = getUserOptionId(user, option);
  let userOption = new UserOption(id);
  userOption.user = user.id;
  userOption.option = option.id;
  userOption.save();
  return userOption;
}

export function getUserOptionId(user: User, option: Option): string {
  return user.id + "-" + option.id;
}

export function getUserOption(user: User, option: Option): UserOption {
  let id = getUserOptionId(user, option);
  let userOption = UserOption.load(id);

  // If no userOption, create one
  if (userOption === null) {
    userOption = createUserOption(user, option);
  }
  return userOption as UserOption;
}
