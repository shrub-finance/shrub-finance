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
