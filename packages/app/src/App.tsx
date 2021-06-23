import OptionsView from "./pages/OptionsView";
import PositionsView from "./pages/PositionsView";
import TopNav from "./components/TopNav";
import { Router } from "@reach/router";
import HomeView from "./pages/HomeView";
import {Web3ReactProvider} from "@web3-react/core";
import {getLibrary} from "./components/ConnectWallets";

function App() {
  return (
    <div className="App">
        <Web3ReactProvider getLibrary={getLibrary}>
            <TopNav />
            <Router>
                <HomeView path="/" />
                <PositionsView path="positions" />
                <OptionsView path="options" />
            </Router>
        </Web3ReactProvider>
    </div>
  );
}

export default App;