import {createContext, useReducer} from "react";
import {pendingTxReducer} from "./PendingTxReducer";
import {PendingTxAction, PendingTxState} from "../types";

let initialState: {
    pendingTxs: [PendingTxState, React.Dispatch<PendingTxAction>]
} = {
    pendingTxs: [{}, () => {}]
};

const Store=({children}: any)=>{
    const [pendingTxsState, pendingTxsDispatch] = useReducer(pendingTxReducer, {})
    initialState = {pendingTxs: [pendingTxsState, pendingTxsDispatch]};

    return (
      <TxContext.Provider value={{pendingTxs: [pendingTxsState, pendingTxsDispatch]}}>
          {children}
      </TxContext.Provider>
    )
}

export const TxContext = createContext(initialState);

export default Store;
