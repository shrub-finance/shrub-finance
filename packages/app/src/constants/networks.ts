export enum SupportedChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
    LOCAL = 1337,
}


export const NETWORK_LABELS: { [chainId in SupportedChainId | number]: string } = {
    [SupportedChainId.MAINNET]: 'Mainnet',
    [SupportedChainId.RINKEBY]: 'Rinkeby',
    [SupportedChainId.ROPSTEN]: 'Ropsten',
    [SupportedChainId.GOERLI]: 'Görli',
    [SupportedChainId.KOVAN]: 'Kovan',
    [SupportedChainId.LOCAL]: 'Local',
}

export const NETWORK_COLORS: { [chainId in SupportedChainId | number]: string } = {
    [SupportedChainId.MAINNET]: 'green',
    [SupportedChainId.RINKEBY]: 'yellow',
    [SupportedChainId.ROPSTEN]: 'pink',
    [SupportedChainId.GOERLI]: 'blue',
    [SupportedChainId.KOVAN]: 'purple',
    [SupportedChainId.LOCAL]: 'white',
}