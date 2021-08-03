import {createContext, useReducer} from "react";
import {reducer} from "./Reducer";
import {PendingTxAction, PendingTxState} from "../types";

let initialState: {
    pendingTxs: [PendingTxState, React.Dispatch<PendingTxAction>]
} = {
    pendingTxs: [{}, () => {}]
};

const Store=({children}: any)=>{
    const [pendingTxsState, pendingTxsDispatch] = useReducer(reducer, {})
    initialState = {pendingTxs: [pendingTxsState, pendingTxsDispatch]};

    return (
      <TxContext.Provider value={{pendingTxs: [pendingTxsState, pendingTxsDispatch]}}>
          {children}
      </TxContext.Provider>
    )
}

export const TxContext = createContext(initialState);

export default Store;
