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
  useRadioGroup
} from '@chakra-ui/react';
import OptionRow from "../components/OptionRow";
import useFetch from "../hooks/useFetch";
import {ApiOrder, AppCommon, ContractData, OptionAction, OptionType, OrderbookStats} from '../types';
import {RouteComponentProps} from "@reach/router";
import RadioCard from '../components/Radio';
import {getEnumKeys} from '../utils/helperMethods';
import {formatExpiry, formatStrike, fromEthDate, toEthDate, transformOrderApiApp} from "../utils/ethMethods";
import {ethers} from "ethers";
import {FaEthereum} from "react-icons/fa";
import {Icon} from "@chakra-ui/icons";

function OptionsView(props: RouteComponentProps) {

  const options: string[] = getEnumKeys(OptionAction)
  const optionTypes: string[] = getEnumKeys(OptionType)
  const [option, setOption] = useState(OptionAction.BUY);
  const [optionType, setOptionType] = useState(OptionType.CALL);
  const [expiryDate, setExpiryDate] = useState<number>();
  const [strikePrices, setStrikePrices] = useState<ethers.BigNumber[]>([]);
  const [expiryDates, setExpiryDates] = useState<number[]>([]);

  const optionRows: JSX.Element[] = [];

  const expiryMap = {};

  // TODO un-hardcode this
  const quoteAsset = process.env.REACT_APP_FK_TOKEN_ADDRESS;
  const baseAsset = ethers.constants.AddressZero;

  if (!quoteAsset || !baseAsset) {
    throw new Error('missing quoteAsset or baseAsset');
  }

  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: OptionAction.BUY,
    // @ts-ignore
    onChange: (nextValue) => setOption(nextValue),
  })

  const {
    getRootProps: getOptionTypeRootProps,
    getRadioProps: getOptionTypeRadioProps,
  } = useRadioGroup({
    name: "optionType",
    defaultValue:  OptionType.CALL,
    // @ts-ignore
    onChange: (nextValue) => setOptionType(nextValue),
  });

  const {
    getRootProps: getExpiryRootProps,
    getRadioProps: getExpiryRadioProps,
  } = useRadioGroup({
    name: "expiryDate",
    onChange: (nextValue) => setExpiryDate(Number(nextValue)),
  });

  const groupOption = getOptionRootProps();
  const groupOptionType = getOptionTypeRootProps();
  const groupExpiry = getExpiryRootProps();

  const url = `${process.env.REACT_APP_API_ENDPOINT}/orders`;
  // TODO: orderData should handle error just like contract data
  const {data:orderData, status: orderDataStatus} = useFetch<ApiOrder[]>(url);
  const contractsUrl = `${process.env.REACT_APP_API_ENDPOINT}/contracts`;
  const {error:contractDataError, data: contractData, status: contractDataStatus} = useFetch<ContractData>(contractsUrl);

  useEffect(() => {

      if (contractData && contractDataStatus === "fetched" && !contractDataError) {
        const expiryDatesNumber = Object.keys(contractData["ETH-FK"]);
        const expiryDatesNice = expiryDatesNumber.map((expiryDateNumber) => {
          return Number(expiryDateNumber);
        })
        setExpiryDates(expiryDatesNice)
        if(!expiryDate) {
          setExpiryDate(expiryDatesNice[0])
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

  // const expiryObj = expiryDates.find(o => o[0] === expiryDate)
  // if (!expiryObj) {
  //     return <></>;
  // }

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
              expiryDate === toEthDate(order.expiry)
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
      Math.max(...buyOrders.map((buyOrder) => Number(buyOrder.unitPrice))).toFixed(2) || '';

    const bestAsk =
      sellOrders &&
      sellOrders.length &&
      Math.min(...sellOrders.map((sellOrder) => Number(sellOrder.unitPrice))).toFixed(2) || '';

    const appCommon:AppCommon = {
      formattedStrike: formatStrike(strikePrice),
      formattedExpiry: formatExpiry(expiryDate),
      optionType,
      quoteAsset,
      baseAsset,
      expiry: fromEthDate(expiryDate),
      strike: strikePrice
    }

    const stats: OrderbookStats = {
      // TODO: provide data for last
      last: '',
      bestBid,
      bestAsk
    }

    if (filteredOrders && filteredOrders[0]) {
      appCommon.expiry = filteredOrders[0].expiry;
      appCommon.strike = filteredOrders[0].strike;
    }


        optionRows.push(
        <OptionRow appCommon={appCommon} isBuy={option === OptionAction.BUY} last={''} ask={bestAsk} bid={bestBid} key={appCommon.formattedStrike} />
      // <PlaceOrder
      //   key={strikePrice}
      //   strikePrice={strikePrice}
      //   bid={bestBid}
      //   ask={bestAsk}
      //   isBuy={option === OptionAction.BUY}
      //   isCall={optionType === OptionType.CALL}
      //   option={option}
      //   optionType={optionType}
      //   expiryDate={expiryDate}
      // />
    );
  }
  return (
      <>
        <Heading mt={10}><Center><Icon as={FaEthereum} /> ETH Options</Center></Heading>

  <Container
      mt={50}
      p={5}
      shadow="md"
      borderWidth="1px"
      flex="1"
      borderRadius="2xl"
      fontFamily="Montserrat"
    >
      {contractDataStatus === "fetching" &&
      <Center >
        <Spinner color="teal" size="xl"/>
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
                <RadioCard key={expiry} {...radio}>
                  {formatExpiry(expiry)}
                </RadioCard>
            );
          })}
        </HStack>
      </Box>
        <Flex mb={10}>
            <HStack {...groupOption}>
              {options.map((value) => {
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
