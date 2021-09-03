import { SupportedChainId } from '../constants/networks'
import {PolygonIcon} from "../assets/Icons";
import {FaEthereum} from "react-icons/fa";

const ETHERSCAN_NETWORKS: { [chainId: number]: string } = {
    [SupportedChainId.MAINNET]: '',
    [SupportedChainId.ROPSTEN]: 'ropsten.',
    [SupportedChainId.RINKEBY]: 'rinkeby.',
    [SupportedChainId.GOERLI]: 'goerli.',
    [SupportedChainId.KOVAN]: 'kovan.'
}

const POLYGONSCAN_NETWORKS: { [chainId: number]: string } = {
    [SupportedChainId.POLYGON]: '',
    [SupportedChainId.MUMBAI]: 'mumbai.'
}

export function explorerLink(chainId: any, data: string): string {
    if (chainId === SupportedChainId.ARBITRUM_RINKEBY) {
        return `https://rinkeby-explorer.arbitrum.io/tx/${data}`
    }
    if (chainId === SupportedChainId.POLYGON ||SupportedChainId.MUMBAI ) {
        const polygonPrefix = `https://${POLYGONSCAN_NETWORKS[chainId] ?? ''}polygonscan.io`
        return `${polygonPrefix}/tx/${data}`
    }
    const prefix = `https://${ETHERSCAN_NETWORKS[chainId] ?? ''}etherscan.io`
    return `${prefix}/tx/${data}`
}

export function currencySymbol(chainId: any) {
    if (chainId === SupportedChainId.POLYGON ||  chainId === SupportedChainId.MUMBAI) {
        return 'MATIC'
    }
    return 'ETH'
}

export function currencyIcon(chainId: any) {
    if (chainId === SupportedChainId.POLYGON ||  chainId === SupportedChainId.MUMBAI) {
        return PolygonIcon
    }
    return FaEthereum
}