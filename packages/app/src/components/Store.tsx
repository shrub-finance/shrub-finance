import {createContext, useReducer} from "react";
import {reducer} from "./Reducer";
import {PendingTxAction, PendingTxState} from "../types";

let initialState: [PendingTxState, React.Dispatch<PendingTxAction>] = [{}, () => {}];

const Store=({children}: any)=>{
    const [pendingTxsState, pendingTxsDispatch] = useReducer(reducer, {})
    initialState = [pendingTxsState, pendingTxsDispatch];

    return (
        <TxContext.Provider value={[pendingTxsState, pendingTxsDispatch]}>
            {children}
        </TxContext.Provider>
    )
}

export const TxContext = createContext(initialState);

export default Store;
