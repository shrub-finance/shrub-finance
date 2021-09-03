import {
    UserOrdersAction, UserOrdersState,
} from "../types";

export function userOrdersReducer (
    state: UserOrdersState,
    action: UserOrdersAction) {
    const { type, order } = action;
    switch (type) {
        case "add":
            const { transactionHash } = order;
            const newOrder = {[transactionHash]: {...order}}
            return{...state, ...newOrder};
        default:
            return state;
    }
}
