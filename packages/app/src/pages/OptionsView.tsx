import React, {useEffect, useState} from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Center,
  Container,
  Flex,
  HStack, Spacer,
  Spinner,
  useRadioGroup
} from '@chakra-ui/react';
import PlaceOrder from "../components/PlaceOrder";
import useFetch from "../hooks/useFetch";
import {ContractData, IOrder, OptionAction, OptionType} from '../types';
import {RouteComponentProps} from "@reach/router";
import RadioCard from '../components/Radio';
import {getEnumKeys} from '../utils/helperMethods';
import theme from "../styles/theme";

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
  const {data:orderData, status: orderDataStatus} = useFetch<IOrder[]>(url);
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

  for (const strikePrice of strikePrices) {

    const filteredOrders =
        orderData &&
        orderDataStatus === "fetched"
        && orderData.filter((order) => {
          const orderOptionTypeString = Object.keys(OptionType)[Number(order.optionType)];
          return order.strike === strikePrice && orderOptionTypeString === OptionType[optionType]
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
      Math.max(...buyOrders.map((buyOrder) => buyOrder.price));

    const bestAsk =
      sellOrders &&
      sellOrders.length &&
      Math.min(...sellOrders.map((buyOrder) => buyOrder.price));

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
    <Container
      mt={100}
      p={5}
      shadow="md"
      borderWidth="1px"
      flex="1"
      borderRadius="lg"
      fontFamily="Montserrat"
    >
      {contractDataStatus === "fetching" &&
      <Center >
        <Spinner color="teal"/>
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
  );
}

export default OptionsView;
