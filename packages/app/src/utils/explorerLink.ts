import { SupportedChainId } from '../constants/networks'

const ETHERSCAN_NETWORKS: { [chainId: number]: string } = {
    [SupportedChainId.MAINNET]: '',
    [SupportedChainId.ROPSTEN]: 'ropsten.',
    [SupportedChainId.RINKEBY]: 'rinkeby.',
    [SupportedChainId.GOERLI]: 'goerli.',
    [SupportedChainId.KOVAN]: 'kovan.'
}

export function explorerLink(chainId: any, data: string): string {
    if (chainId === SupportedChainId.ARBITRUM_RINKEBY) {
        return `https://rinkeby-explorer.arbitrum.io/tx/${data}`
    }
    if (chainId === SupportedChainId.POLYGON) {
       return `https://polygonscan.com/tx/${data}`
    }
    if (chainId === SupportedChainId.MUMBAI) {
       return `https://mumbai.polygonscan.com/tx/${data}`
    }
    const prefix = `https://${ETHERSCAN_NETWORKS[chainId] ?? ''}etherscan.io`
    return `${prefix}/tx/${data}`
}
