import OptionsView from "./pages/OptionsView";
import PositionsView from "./pages/PositionsView";
import TopNav from "./components/TopNav";
import { Router } from "@reach/router";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./components/ConnectWallet";
import Store from "./components/Store";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import HomeView from "./pages/HomeView";
import ReactGA from "react-ga"
import { useEffect } from "react";

const trackingID=process.env.REACT_APP_TRACKING_ID;
if(trackingID){
  ReactGA.initialize(trackingID,{
    gaOptions:{
      storage:"none",
      storeGac:false
    }
  })
  ReactGA.set({anonymizeIp:true})
}
else{
  ReactGA.initialize("test",{testMode:true,debug:true})
}

function trackPage(page:string){
  ReactGA.set({page})
  ReactGA.pageview(page)
}

function App() {
  const client = new ApolloClient({
    uri: process.env.REACT_APP_SUBGRAPH_QUERY,
    cache: new InMemoryCache(),
    connectToDevTools: process.env.REACT_APP_ENVIRONMENT === "development",
  });
  useEffect(()=>{
    const page=location.pathname;
    trackPage(page);
  },[])

  return (
    <div className="App">
      <Web3ReactProvider getLibrary={getLibrary}>
        <ApolloProvider client={client}>
          <Store>
            <TopNav />
            <Router>
              <HomeView path="/" />
              <PositionsView path="shrubfolio" />
              <OptionsView path="options" />
            </Router>
          </Store>
        </ApolloProvider>
      </Web3ReactProvider>
    </div>
  );
}

export default App;
