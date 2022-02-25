export function nonceReducer(
  // eslint-disable-next-line @typescript-eslint/ban-types
  state:
    | { [user: string]: { [pair: string]: number } }
    // eslint-disable-next-line @typescript-eslint/ban-types
    | { [user: string]: {} },
  action: { type: "update"; user: string; pair: string; nonce: number }
) {
  const { type, user, pair, nonce } = action;
  switch (type) {
    case "update":
      // eslint-disable-next-line no-case-declarations
      let userNonce;
      if (state[user]) {
        userNonce = {
          ...(state[user] || {}),
          [user]: { [pair]: nonce },
        };
      } else {
        userNonce = { [user]: { [pair]: nonce } };
      }
      return {
        ...state,
        ...userNonce,
      };
    default:
      return state;
  }
}
