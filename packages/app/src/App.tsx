import OptionsView from "./pages/OptionsView";
import PositionsView from "./pages/PositionsView";
import TopNav from "./components/TopNav";
import { Router } from "@reach/router";
import {Web3ReactProvider} from "@web3-react/core";
import {getLibrary} from "./components/ConnectWallet";
import React from 'react';
import Store from "./components/Store";


function App() {


    return (
        <div className="App">
            <Web3ReactProvider getLibrary={getLibrary}>
                <Store>
                    <TopNav/>
                <Router>
                        <PositionsView path="shrubfolio"/>
                        <OptionsView path="options"/>
                </Router>
                </Store>
            </Web3ReactProvider>
        </div>
    );


}

export default App;
