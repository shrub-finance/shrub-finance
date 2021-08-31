import {PendingTxAction, PendingTxState} from "../types";

export function pendingTxReducer (

    state: PendingTxState,
    action: PendingTxAction) {
    const { type, txHash, status, description } = action;
    const now = new Date()
    switch (action.type) {
        case "add":
            if (!txHash) {
                throw new Error('txHash required for add');
            }
            if (!description) {
                throw new Error('description required for add');
            }
            state[txHash] = { description, status: 'confirming', created: now, updated: now }
            return {...state};
        case "update":
            if (!txHash) {
                throw new Error('txHash required for update')
            }
            if (!status) {
                throw new Error('status required for update');
            }
            state[txHash].status = status;
            state[txHash].updated = now;
            return {...state};
        case "clear":
            return {};
        default: throw new Error(`invalid type ${type}`);
    }
}
