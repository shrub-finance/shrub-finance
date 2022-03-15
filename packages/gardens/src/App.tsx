import TopNav from "./components/TopNav";
import { Router } from "@reach/router";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./components/ConnectWallet";
import React, { useEffect } from "react";
import Store from "./components/Store";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import HomeView from "./pages/HomeView";
import PaperView from "./pages/PaperView";
import LeaderBoardView from "./pages/LeaderBoardView";
import AdoptionCenterView from "./pages/AdoptionCenterView";
import MyPaperGardenView from "./pages/MyPaperGardenView";
import ReactGA from 'react-ga'
const trackingID = process.env.REACT_APP_TRACKING_ID;
if (trackingID) {
  ReactGA.initialize(trackingID, {
    gaOptions: {
      storage: 'none',
      storeGac: false
    }
  })
  ReactGA.set({
    anonymizeIp: true
  })
}
else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}


function trackPage(page: string) {
  ReactGA.set({ page })
  ReactGA.pageview(page);
}
function App() {
  const client = new ApolloClient({
    uri: process.env.REACT_APP_SUBGRAPH_QUERY,
    cache: new InMemoryCache(),
    connectToDevTools: process.env.REACT_APP_ENVIRONMENT === "development",
  });
  useEffect(() => {
    const page = location.pathname;
    trackPage(page);
    
  }, [])

  return (
    <div className="App">
      <Web3ReactProvider getLibrary={getLibrary}>
        <ApolloProvider client={client}>
          <Store>
            <TopNav />
            <Router>
              <HomeView path="/" />
              <HomeView path="/claim" />
              <LeaderBoardView path="leaderboard" />
              <PaperView path="/nft/paper-seed/:tokenId" />
              <AdoptionCenterView path="/adoption" />
              <MyPaperGardenView path="/my-garden" />
            </Router>
          </Store>
        </ApolloProvider>
      </Web3ReactProvider>
    </div>
  );
}

export default App;
