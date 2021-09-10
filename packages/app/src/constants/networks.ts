export enum SupportedChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
    ARBITRUM_RINKEBY=421611,
    MUMBAI=80001,
    POLYGON=137,
    LOCAL = 1337
}


export const NETWORK_LABELS: { [chainId in SupportedChainId | number]: string } = {
    [SupportedChainId.MAINNET]: 'Ethereum',
    [SupportedChainId.RINKEBY]: 'Rinkeby',
    [SupportedChainId.ROPSTEN]: 'Ropsten',
    [SupportedChainId.GOERLI]: 'Goerli',
    [SupportedChainId.KOVAN]: 'Kovan',
    [SupportedChainId.ARBITRUM_RINKEBY]: 'Arbitrum Test',
    [SupportedChainId.POLYGON]: 'Polygon',
    [SupportedChainId.MUMBAI]: 'Mumbai',
    [SupportedChainId.LOCAL]: 'Local'
}

export const NETWORK_COLORS: { [chainId in SupportedChainId | number]: string } = {
    [SupportedChainId.MAINNET]: 'green',
    [SupportedChainId.RINKEBY]: 'yellow',
    [SupportedChainId.ROPSTEN]: 'pink',
    [SupportedChainId.GOERLI]: 'blue',
    [SupportedChainId.KOVAN]: 'purple',
    [SupportedChainId.ARBITRUM_RINKEBY]: 'blue',
    [SupportedChainId.POLYGON]: 'purple',
    [SupportedChainId.MUMBAI]: 'blue',
    [SupportedChainId.LOCAL]: 'red'
}

export const NETWORK_CONTRACT_ADDRESS: { [chainId in SupportedChainId | number]: string } = {
    [SupportedChainId.MUMBAI]: '0x97D46d03909D6B664880ce5A4b59edda0e41D080',
    [SupportedChainId.LOCAL]: '0x6a9D4aF8BF697679f4441dDeD9E2B8F1F31D3e85'
}


