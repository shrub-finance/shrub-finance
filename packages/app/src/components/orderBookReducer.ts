import {
    OrderBookAction,
    OrderBookState,
} from "../types";

export function orderBookReducer (
    state: OrderBookState,
    action: OrderBookAction) {
    const { type, orders } = action;
    switch (type) {
        case "add":
            for (const order of orders) {
                const { baseAsset, quoteAsset, optionType, strike, formattedExpiry, optionAction, transactionHash } = order;
                const stringStrike = strike.toString();
                if (!state[quoteAsset] ) {
                    state[quoteAsset] = {}
                }
                if (!state[quoteAsset][baseAsset]) {
                    state[quoteAsset][baseAsset] = {};
                }
                if (!state[quoteAsset][baseAsset][formattedExpiry]) {
                    state[quoteAsset][baseAsset][formattedExpiry] = {};
                }
                if (!state[quoteAsset][baseAsset][formattedExpiry][optionType]) {
                    state[quoteAsset][baseAsset][formattedExpiry][optionType] = {};
                }
                if (!state[quoteAsset][baseAsset][formattedExpiry][optionType][stringStrike]) {
                    state[quoteAsset][baseAsset][formattedExpiry][optionType][stringStrike] = { buyOrdersIndexed: {}, sellOrdersIndexed: {}, sellOrders: [], buyOrders: [], last: ''};
                }
                const positionPointer = state[quoteAsset][baseAsset][formattedExpiry][optionType][stringStrike];
                if (optionAction === 'BUY') {
                    // Case: bid
                    if (positionPointer.buyOrdersIndexed[transactionHash]) {
                        continue;
                    }
                    positionPointer.buyOrdersIndexed[transactionHash] = order
                    positionPointer.buyOrders = Object.values(positionPointer.buyOrdersIndexed)
                    if(!positionPointer.bid || order.unitPrice > positionPointer.bid) {
                        positionPointer.bid = order.unitPrice;
                    }
                } else {
                    // Case: ask
                    if (positionPointer.sellOrdersIndexed[transactionHash]) {
                        continue;
                    }
                    positionPointer.sellOrdersIndexed[transactionHash] = order
                    positionPointer.sellOrders = Object.values(positionPointer.sellOrdersIndexed)
                    if(!positionPointer.ask || order.unitPrice < positionPointer.ask) {
                        positionPointer.ask = order.unitPrice;
                    }
                }
            }

            return{...state};
        default:
            return state;
    }
}
