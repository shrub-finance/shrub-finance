import { InjectedConnector } from "@web3-react/injected-connector";
import { NetworkConnector } from "@web3-react/network-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";
import { PortisConnector } from "@web3-react/portis-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { SafeAppConnector } from "@gnosis.pm/safe-apps-web3-react";

const POLLING_INTERVAL = 12000;

const RPC_URLS: { [chainId: number]: string } = {
  1: process.env.REACT_APP_RPC_URL_1 as string,
  4: process.env.REACT_APP_RPC_URL_4 as string,
  42: process.env.REACT_APP_RPC_URL_42 as string,
  1337: process.env.REACT_APP_RPC_URL_1337 as string,
  421611: process.env.REACT_APP_RPC_URL_421611 as string,
  80001: process.env.REACT_APP_RPC_URL_80001 as string,
  137: process.env.REACT_APP_RPC_URL_137 as string,
};

const chainId = Number(process.env.REACT_APP_CHAIN_ID);
if (!chainId) {
  throw new Error("Invalid chainId");
}

export const injected = new InjectedConnector({
  // This dictates which networks are considered valid
  // supportedChainIds: [1, 3, 4, 5, 42, 421611, 80001, 137, 1337],
  supportedChainIds: [chainId],
});

export const network = new NetworkConnector({
  urls: {
    1: RPC_URLS[1],
    4: RPC_URLS[4],
    42: RPC_URLS[42],
    1337: RPC_URLS[1337],
    421611: RPC_URLS[421611],
    80001: RPC_URLS[80001],
    137: RPC_URLS[137],
  },
  defaultChainId: 1,
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: "web3-react example",
});

export const ledger = new LedgerConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
});

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: process.env.REACT_APP_FORTMATIC_KEY ?? "",
  chainId: 1,
});

// mainnet only
export const portis = new PortisConnector({
  // dAppId: PORTIS_ID ?? '',
  dAppId: "",
  networks: [1],
});

export const gnosisSafe = new SafeAppConnector();
