import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Center,
  Container,
  Flex, Heading,
  HStack,
  Spacer,
  Spinner,
  Tooltip,
  Text,
  useColorModeValue,
  useRadioGroup
} from '@chakra-ui/react';
import OptionRow from "../components/OptionRow";
import useFetch from "../hooks/useFetch";
import {ApiOrder, AppCommon, ContractData, LastOrders, OrderbookStats, OrderCommon, PutCall, SellBuy} from '../types';
import {RouteComponentProps} from "@reach/router";
import RadioCard from '../components/Radio';
import {
  formatDate,
  formatStrike,
  fromEthDate, getLastOrders,
  hashOrderCommon, optionTypeToNumber,
  toEthDate,
  transformOrderApiApp
} from "../utils/ethMethods";
import {ethers} from "ethers";
import {FaEthereum} from "react-icons/fa";
import {Icon, QuestionOutlineIcon} from '@chakra-ui/icons';
import {useWeb3React} from "@web3-react/core";

function OptionsView(props: RouteComponentProps) {
  const {active, library, account, error: web3Error} = useWeb3React();
  const sellBuys = ['BUY', 'SELL']
  const optionTypes = ['PUT', 'CALL']
  const [sellBuy, setSellBuy] = useState<SellBuy>('BUY');
  const [optionType, setOptionType] = useState<PutCall>('CALL');
  const [expiryDate, setExpiryDate] = useState<string>();
  const [strikePrices, setStrikePrices] = useState<ethers.BigNumber[]>([]);
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [lastMatches, setLastMatches] = useState<LastOrders>({})

  const optionRows: JSX.Element[] = [];

  // TODO un-hardcode this
  const quoteAsset = ethers.constants.AddressZero;
  const baseAsset = process.env.REACT_APP_FK_TOKEN_ADDRESS;

  if (!quoteAsset || !baseAsset) {
    throw new Error('missing quoteAsset or baseAsset');
  }

  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: sellBuy,
    onChange: (nextValue: SellBuy) => setSellBuy(nextValue),
  })

  const {
    getRootProps: getOptionTypeRootProps,
    getRadioProps: getOptionTypeRadioProps,
  } = useRadioGroup({
    name: "optionType",
    defaultValue: optionType,
    onChange: (nextValue: PutCall) => setOptionType(nextValue),
  });

  const {
    getRootProps: getExpiryRootProps,
    getRadioProps: getExpiryRadioProps,
  } = useRadioGroup({
    name: "expiryDate",
    defaultValue: '',
    onChange: (nextValue) => setExpiryDate(nextValue),
  });

  const groupOption = getOptionRootProps();
  const groupOptionType = getOptionTypeRootProps();
  const groupExpiry = getExpiryRootProps();

  const url = `${process.env.REACT_APP_API_ENDPOINT}/orders`;
  // TODO: orderData should handle error just like contract data
  const {data:orderData, status: orderDataStatus} = useFetch<ApiOrder[]>(url);
  const contractsUrl = `${process.env.REACT_APP_API_ENDPOINT}/contracts`;
  const {error:contractDataError, data: contractData, status: contractDataStatus} = useFetch<ContractData>(contractsUrl);

  // On load
  useEffect(() => {
    console.log('running useEffect')
    getLastOrders(library)
      .then(lasts => {
        setLastMatches(lasts)
        console.log(lasts);
      })
      .catch(console.error);
  }, [library]);

  useEffect(() => {

      if (contractData && contractDataStatus === "fetched" && !contractDataError) {
        const expiryDatesString = Object.keys(contractData["ETH-FK"]);
        setExpiryDates(expiryDatesString);
        if(!expiryDate) {
          setExpiryDate(expiryDatesString[0]);
        }
      }
      }, [contractDataStatus]);

  useEffect(() => {
    if(contractData && expiryDate) {
      const strikeObjPrices = contractData['ETH-FK'][expiryDate][optionType].map((strikeNum) => {
        return ethers.BigNumber.from(strikeNum);
      })
      setStrikePrices(strikeObjPrices);
    }

  },[expiryDate, optionType]);

  const formattedOrderData = useMemo(() => {
    return orderData && orderData.map(order => transformOrderApiApp(order));
  }, [orderData])

  for (const strikePrice of strikePrices) {

    if (!expiryDate) {
      continue;
    }

    const filteredOrders =
        formattedOrderData &&
        orderDataStatus === "fetched"
        && formattedOrderData.filter((order) => {
          return order.strike.eq(strikePrice) &&
              optionType === order.optionType &&
              expiryDate === toEthDate(order.expiry).toString()
        }
    );

    const buyOrders =
      filteredOrders &&
      filteredOrders.filter((filteredOrder) => filteredOrder.optionAction === 'BUY');

    const sellOrders =
      filteredOrders &&
      filteredOrders.filter((filteredOrder) => filteredOrder.optionAction === 'SELL');

    const bestBid =
      buyOrders &&
      buyOrders.length &&
        Math.max(...buyOrders.map((buyOrder) => buyOrder.unitPrice)).toFixed(2) || '';

    const bestAsk =
      sellOrders &&
      sellOrders.length &&
        Math.min(...sellOrders.map((sellOrder) => sellOrder.unitPrice)).toFixed(2) || '';

    const appCommon:AppCommon = {
      formattedStrike: formatStrike(strikePrice),
      formattedExpiry: formatDate(Number(expiryDate)),
      optionType,
      quoteAsset,
      baseAsset,
      expiry: fromEthDate(Number(expiryDate)),
      strike: strikePrice
    }

    const orderCommon: OrderCommon = {
      baseAsset,
      quoteAsset,
      expiry: Number(expiryDate),
      strike: strikePrice,
      optionType: optionTypeToNumber(optionType)
    }
    const positionHash = hashOrderCommon(orderCommon)
    console.log(positionHash);
    const last = lastMatches[positionHash] ? String(lastMatches[positionHash]) : ' -';

    const stats: OrderbookStats = {
      // TODO: provide data for last
      last,
      bestBid,
      bestAsk
    }

    if (filteredOrders && filteredOrders[0]) {
      appCommon.expiry = filteredOrders[0].expiry;
      appCommon.strike = filteredOrders[0].strike;
    }

    optionRows.push(
      <OptionRow appCommon={appCommon} option={sellBuy} last={last} ask={bestAsk} bid={bestBid} key={appCommon.formattedStrike} />
    );
  }
  return (
      <>
        <Heading mt={10}><Center><Icon as={FaEthereum} /> ETH Options</Center></Heading>

  <Container
      mt={50}
      p={5}
      shadow={useColorModeValue("2xl", "2xl")}
      flex="1"
      borderRadius="2xl"
      bg={useColorModeValue("white", "shrub.100")}
    >
      {contractDataStatus === "fetching" &&
      <Center >
        <Spinner color="bud.100" size="xl"/>
      </Center>

      }
      {contractDataError &&
      <Box>
        <Alert status="error" borderRadius={9}>
          <AlertIcon />
          <AlertDescription>{contractDataError}</AlertDescription>
        </Alert>
      </Box>
      }
      {contractDataStatus === "fetched" &&
          <>
      <Box mb={10}>
        <HStack {...groupExpiry}>
          {expiryDates.map((expiry) => {
            const radio = getExpiryRadioProps({ value: expiry });
            return (
                (Number(expiry)*1000) > Date.now() &&
                  <RadioCard key={expiry} {...radio}>
                    {formatDate(Number(expiry))}
                  </RadioCard>
            );
          })}
          // do not delete, leave it commented out for now
          {/*<RadioCard>*/}
          {/*  Special Dates*/}
          {/*  <Tooltip p={3} label="Own the future. This date picker let's you pick important upcoming events in ETH land as your expiry. " fontSize="xs" borderRadius="lg" bg="shrub.300" color="white">*/}
          {/*  <Text as="sup" pl={1}><QuestionOutlineIcon/></Text>*/}
          {/*</Tooltip>*/}
          {/*</RadioCard>*/}
        </HStack>
      </Box>
        <Flex mb={10}>
            <HStack {...groupOption}>
              {sellBuys.map((value) => {
                const radio = getOptionRadioProps({ value });
                return (
                    <RadioCard key={value} {...radio}>
                      {value}
                    </RadioCard>
                );
              })}
            </HStack>
          <Spacer/>
            <HStack {...groupOptionType}>
              {optionTypes.map((value) => {
                const radio = getOptionTypeRadioProps({ value });
                return (
                    <RadioCard key={value} {...radio}>
                      {value}
                    </RadioCard>
                );
              })}
            </HStack>
        </Flex>
          </>
      }
      {optionRows}
    </Container>
      </>
  );
}

export default OptionsView;
