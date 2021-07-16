import {PendingStatuses} from "../types";

export function reducer (

    state: {[txHash: string]: { description: string, status: PendingStatuses, created: Date, updated: Date}},
    action: { type: 'add'|'update'|'clear', txHash?: string, description?: string, status?: PendingStatuses}) {
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
        // case "get":
        //     const pendingTxArr = [];
        //     for (const [txHash, {status, description, created}] of Object.entries(state)) {
        //         pendingTxArr.push({ txHash, status, description, created });
        //     }
        //     return pendingTxArr
        //         .sort((a,b) => a.created.getTime() - b.created.getTime())
        //         .map(arr => {txHash, status, description})
        default: throw new Error(`invalid type ${type}`);
    }
}
