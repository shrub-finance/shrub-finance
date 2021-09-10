export function nonceReducer (
    state: {[user: string]: {[pair: string]: number}} | {[user: string]: {}},
    action: {type: 'update', user: string, pair: string, nonce: number}
) {
    const { type, user, pair, nonce } = action;
    switch (type) {
        case 'update':
          let userNonce;
          if (state[user]) {
              userNonce = {
                  ...(state[user] || {}),
                  [user]: {[pair]: nonce}
              }
          } else {
              userNonce = {[user]: {[pair]: nonce}}
          }
            return {
                ...state,
                ...userNonce
            }
        default:
            return state;
    }
}
