import OptionsView from "./pages/OptionsView";
import PositionsView from "./pages/PositionsView";
import TopNav from "./components/TopNav";
import { Router } from "@reach/router";
import {Web3ReactProvider} from "@web3-react/core";
import {getLibrary} from "./components/ConnectWallet";

function App() {
  return (
    <div className="App">
        <Web3ReactProvider getLibrary={getLibrary}>
            <TopNav />
            <Router>
                <PositionsView path="shrubfolio" />
                <OptionsView path="options" />
            </Router>
        </Web3ReactProvider>
    </div>
  );
}

export default App;
