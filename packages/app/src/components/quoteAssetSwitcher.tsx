import { useWeb3React } from '@web3-react/core'
import { NETWORK_COLORS, NETWORK_LABELS } from '../constants/networks'
import { Box, Button } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { RiSignalTowerLine } from 'react-icons/all'
import React from 'react'
import usePriceFeed from '../hooks/usePriceFeed'

const CHAINLINK_MATIC = '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada';  // Mumbai

export function QuoteAssetSwitcher() {

  const {chainId} = useWeb3React()
  const network = chainId && NETWORK_LABELS[chainId]
  const networkColor = chainId && NETWORK_COLORS[chainId]
  const { price: maticPrice } = usePriceFeed(CHAINLINK_MATIC);

  return (

    <Box>
      {maticPrice && (

        <Button
          variant={"ghost"}
          // @ts-ignore
          colorScheme={networkColor}
          size={"sm"}
          mr={4}
          borderRadius="2xl"
        >
          MATIC: {maticPrice}
        </Button>
      )
      }
    </Box>
  )


}
