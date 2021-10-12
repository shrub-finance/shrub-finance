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

export enum ExplorerDataType {
    TRANSACTION = 'transaction',
    ADDRESS = 'address',
    BLOCK = 'block',
}

const POLYGONSCAN_NETWORKS: { [chainId: number]: string } = {
    [SupportedChainId.POLYGON]: '',
    [SupportedChainId.MUMBAI]: 'mumbai.'
}

export function explorerLink(chainId: any, data: any, type: ExplorerDataType): string {
    if (chainId === SupportedChainId.ARBITRUM_RINKEBY) {
        switch (type) {
            case ExplorerDataType.TRANSACTION:
                return `https://rinkeby-explorer.arbitrum.io/tx/${data}`
            case ExplorerDataType.ADDRESS:
                return `https://rinkeby-explorer.arbitrum.io/address/${data}`
            case ExplorerDataType.BLOCK:
                return `https://rinkeby-explorer.arbitrum.io/block/${data}`
            default:
                return `https://rinkeby-explorer.arbitrum.io/`
        }
    }
    if (chainId === SupportedChainId.POLYGON || chainId === SupportedChainId.MUMBAI ) {
        const polygonPrefix = `https://${POLYGONSCAN_NETWORKS[chainId] ?? ''}polygonscan.com`
        switch (type) {
            case ExplorerDataType.TRANSACTION:
                return `${polygonPrefix}/tx/${data}`

            case ExplorerDataType.BLOCK:
                return `${polygonPrefix}/block/${data}`

            case ExplorerDataType.ADDRESS:
                return `${polygonPrefix}/address/${data}`
            default:
                return `${polygonPrefix}`
        }
    }

    const prefix = `https://${ETHERSCAN_NETWORKS[chainId] ?? ''}etherscan.io`
    switch (type) {
        case ExplorerDataType.TRANSACTION:
            return `${prefix}/tx/${data}`

        case ExplorerDataType.BLOCK:
            return `${prefix}/block/${data}`

        case ExplorerDataType.ADDRESS:
            return `${prefix}/address/${data}`
        default:
            return `${prefix}`
    }
}

export function currencySymbol(chainId: any) {
    if (chainId === SupportedChainId.POLYGON ||  chainId === SupportedChainId.MUMBAI) {
        return 'MATIC'
    }
    return 'MATIC'
}

export function currencyIcon(chainId: any) {
    if (chainId === SupportedChainId.POLYGON ||  chainId === SupportedChainId.MUMBAI) {
        return PolygonIcon
    }
    return PolygonIcon
}
