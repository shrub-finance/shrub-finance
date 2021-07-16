import {createContext, useReducer} from "react";
import {reducer} from "./Reducer";

const initialState: any[] = [];

const Store=({children}: any)=>{
    const [pendingTxsState, pendingTxsDispatch] = useReducer(reducer, {})

    return (
        <TxContext.Provider value={[pendingTxsState, pendingTxsDispatch]}>
            {children}
        </TxContext.Provider>
    )
}

export const TxContext = createContext(initialState);

export default Store;
