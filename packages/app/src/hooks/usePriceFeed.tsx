// imports
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import useInterval from './useInterval'
import { chainlinkAggregatorV3Interface } from '../constants/externalAbis'


function usePriceFeed(chainlinkAddress: string) {
  // hooks
  const {active, library} = useWeb3React();
  const [price, setPrice] = useState<number>();
  useInterval(async() => {
    if (!active) {
      return;
    }
    const priceFeed = new ethers.Contract(chainlinkAddress, chainlinkAggregatorV3Interface, library);
    let priceBig: {answer: BigNumber};
    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      priceBig = {answer: BigNumber.from(10).pow(8).mul(2)};
    } else {
      priceBig = await priceFeed.latestRoundData();
    }
    const tokenPrice = Number(ethers.utils.formatUnits(priceBig.answer, 8));
    setPrice(tokenPrice);
  }, 60000)

  useEffect(() => {
    if (!active) {
      return;
    }
    async function main() {
      const priceFeed = new ethers.Contract(chainlinkAddress, chainlinkAggregatorV3Interface, library);
      let priceBig: {answer: BigNumber};
      if (process.env.REACT_APP_ENVIRONMENT === 'development') {
        priceBig = {answer: BigNumber.from(10).pow(8).mul(2)};
      } else {
        priceBig = await priceFeed.latestRoundData();
      }
      const tokenPrice = Number(ethers.utils.formatUnits(priceBig.answer, 8));
      setPrice(tokenPrice);
    }
    main().catch(console.error);
  }, [active])

  return {price};
}

export default usePriceFeed;
