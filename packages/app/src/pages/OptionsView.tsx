import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Center,
  Container,
  Flex, Heading,
  HStack, Spacer,
  Spinner, useColorModeValue,
  useRadioGroup
} from '@chakra-ui/react';
import PlaceOrder from "../components/PlaceOrder";
import useFetch from "../hooks/useFetch";
import {ApiOrder, ContractData, IOrder, OptionAction, OptionType} from '../types';
import {RouteComponentProps} from "@reach/router";
import RadioCard from '../components/Radio';
import {getEnumKeys} from '../utils/helperMethods';
import {transformOrderApiApp} from "../utils/ethMethods";
import {FaEthereum} from "react-icons/fa";
import {Icon} from "@chakra-ui/icons";

function OptionsView(props: RouteComponentProps) {

  const options: string[] = getEnumKeys(OptionAction)
  const optionTypes: string[] = getEnumKeys(OptionType)
  const [option, setOption] = useState(OptionAction.BUY);
  const [optionType, setOptionType] = useState(OptionType.CALL);
  const [expiryDate, setExpiryDate] = useState("");
  const [strikePrices, setStrikePrices] = useState([]);
  const [expiryDates, setExpiryDates] = useState([]);

  const optionRows: any = [];

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

  useEffect(() => {

      if (contractData && contractDataStatus === "fetched" && !contractDataError) {
        // @ts-ignore
        const expiryDatesLocal = Object.keys(contractData["ETH-FK"]);
        // @ts-ignore
        setExpiryDates(expiryDatesLocal);
        if(!expiryDate) {
          setExpiryDate(expiryDatesLocal[0])
        }
      }
      }, [contractDataStatus]);

  useEffect(() => {
    if(expiryDate) {
      // @ts-ignore
      setStrikePrices(contractData["ETH-FK"][expiryDate][optionType]);
    }

  },[expiryDate, optionType]);

  const formattedOrderData = useMemo(() => {
    return orderData && orderData.map(order => transformOrderApiApp(order));
  }, [orderData])

  for (const strikePrice of strikePrices) {

    const filteredOrders =
        formattedOrderData &&
        orderDataStatus === "fetched"
        && formattedOrderData.filter((order) => {
          return Number(order.formattedStrike) === strikePrice &&
              optionType === order.optionType &&
              expiryDate === order.formattedExpiry
        }
    );

    const buyOrders =
      filteredOrders &&
      filteredOrders.filter((filteredOrder) => filteredOrder.isBuy);

    const sellOrders =
      filteredOrders &&
      filteredOrders.filter((filteredOrder) => !filteredOrder.isBuy);

    const bestBid =
      buyOrders &&
      buyOrders.length &&
      Math.max(...buyOrders.map((buyOrder) => Number(buyOrder.formattedPrice)));

    const bestAsk =
      sellOrders &&
      sellOrders.length &&
      Math.min(...sellOrders.map((sellOrder) => Number(sellOrder.formattedPrice)));

    optionRows.push(
      <PlaceOrder
        key={strikePrice}
        strikePrice={strikePrice}
        bid={bestBid}
        ask={bestAsk}
        isBuy={option === OptionAction.BUY}
        isCall={optionType === OptionType.CALL}
        option={option}
        optionType={optionType}
        expiryDate={expiryDate}
      />
    );
  }
  return (
      <>
        <Heading mt={10}><Center><Icon as={FaEthereum} /> ETH Options</Center></Heading>

  <Container
      mt={50}
      p={5}
      shadow={useColorModeValue("2xl", "2xl")}
      // borderWidth="1px"
      flex="1"
      borderRadius="2xl"
      fontFamily="Montserrat"
      bg={useColorModeValue("white", "rgb(31, 31, 65)")}
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
          {expiryDates.map((value) => {
            const radio = getExpiryRadioProps({ value });
            return (
                <RadioCard key={value} {...radio}>
                  {value}
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
