import TopNav from "./components/TopNav";
import { Router, createHistory, LocationProvider } from "@reach/router";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./components/ConnectWallet";
import React, { useEffect } from "react";
import HomeView from "./pages/HomeView";
import ReactGA from "react-ga";
const trackingID = process.env.REACT_APP_TRACKING_ID;
if (trackingID) {
  ReactGA.initialize(trackingID, {
    gaOptions: {
      storage: "none",
      storeGac: false,
    },
  });
  ReactGA.set({
    anonymizeIp: true,
  });
} else {
  ReactGA.initialize("test", { testMode: true, debug: true });
}

function trackPage(page: string) {
  ReactGA.set({ page });
  ReactGA.pageview(page);
}

const windowContext: any = window;
const history = createHistory(windowContext);

function App() {
  useEffect(() => {
    const page = location.pathname;
    trackPage(page);
  }, []);

  return (
    <div className="App">
      <LocationProvider history={history}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <TopNav />
          <Router>
            <HomeView path="/" />
          </Router>
        </Web3ReactProvider>
      </LocationProvider>
    </div>
  );
}

export default App;
