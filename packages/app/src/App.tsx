import OptionsView from "./pages/OptionsView";
import PositionsView from "./pages/PositionsView";
import TopNav from "./components/TopNav";
import { Router } from "@reach/router";
import {Web3ReactProvider} from "@web3-react/core";
import {getLibrary} from "./components/ConnectWallet";
import React from 'react';
import Store from "./components/Store";
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'


function App() {

  const client = new ApolloClient({
    uri: 'http://127.0.0.1:8000/subgraphs/name/jguthrie7/shrub-subgraph',
    cache: new InMemoryCache()
  })


  return (
    <div className='App'>
      <Web3ReactProvider getLibrary={getLibrary}>
        <ApolloProvider client={client}>
        <Store>
          <TopNav />
          <Router>
            <PositionsView path='shrubfolio' />
            <OptionsView path='options' />
          </Router>
        </Store>
        </ApolloProvider>
      </Web3ReactProvider>
    </div>
  )


}

export default App;
