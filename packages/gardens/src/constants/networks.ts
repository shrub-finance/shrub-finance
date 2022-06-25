export enum SupportedChainId {
  MUMBAI = 80001,
  POLYGON = 137,
  LOCAL = 1337,
}

export const NETWORK_LABELS: {
  [chainId in SupportedChainId | number]: string;
} = {
  [SupportedChainId.POLYGON]: "Polygon",
  [SupportedChainId.MUMBAI]: "Mumbai",
  [SupportedChainId.LOCAL]: "Local",
};

export const NETWORK_COLORS: {
  [chainId in SupportedChainId | number]: string;
} = {
  [SupportedChainId.POLYGON]: "purple",
  [SupportedChainId.MUMBAI]: "blue",
  [SupportedChainId.LOCAL]: "red",
};

export const NETWORK_CONTRACT_ADDRESS: {
  [chainId in SupportedChainId | number]: string;
} = {
  [SupportedChainId.MUMBAI]: "0x97D46d03909D6B664880ce5A4b59edda0e41D080",
  [SupportedChainId.LOCAL]: "0x6a9D4aF8BF697679f4441dDeD9E2B8F1F31D3e85",
};

export const NETWORK_RPC_DETAILS: {
  [chainId in SupportedChainId | number]: Record<string, unknown>;
} = {
  [SupportedChainId.MUMBAI]: {
    chainId: "0x13881",
    chainName: "Polygon Testnet",
    nativeCurrency: {
      name: "Polygon Matic",
      symbol: "Matic",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  },
  [SupportedChainId.POLYGON]: {
    chainId: "0x89",
    chainName: "Polygon Network",
    nativeCurrency: {
      name: "Polygon Matic",
      symbol: "Matic",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
};
