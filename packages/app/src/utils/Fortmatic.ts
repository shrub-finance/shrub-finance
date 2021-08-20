import { FortmaticConnector  } from '@web3-react/fortmatic-connector'

export const OVERLAY_READY = 'OVERLAY_READY'

type FormaticSupportedChains = 1 | 3 | 4 | 42

const CHAIN_ID_NETWORK_ARGUMENT: { readonly [chainId in FormaticSupportedChains]: string | undefined } = {
    1: undefined,
    3: 'ropsten',
    4: 'rinkeby',
    42: 'kovan',
}

export function FortmaticConnector()  {
    async activate() {
        if (!fortmatic) {
            const { default: Fortmatic } = await import('fortmatic')

            const { apiKey, chainId } =
            if (chainId in CHAIN_ID_NETWORK_ARGUMENT) {
                fortmatic = new Fortmatic(apiKey, CHAIN_ID_NETWORK_ARGUMENT[chainId as FormaticSupportedChains])
            } else {
                throw new Error(`Unsupported network ID: ${chainId}`)
            }
        }

        const provider = fortmatic.getProvider()

        const pollForOverlayReady = new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                if (provider.overlayReady) {
                    clearInterval(interval)
                    emit(OVERLAY_READY)
                    resolve()
                }
            }, 200)
        })

        const [account] = await Promise.all([
            provider.enable().then((accounts: string[]) => accounts[0]),
            pollForOverlayReady,
        ])

        return { provider: fortmatic.getProvider(), chainId: ().chainId, account }
    }
}
