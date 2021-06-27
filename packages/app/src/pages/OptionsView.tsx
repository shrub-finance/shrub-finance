import React from "react";
import {
  Box,
  Container,
  Grid,
  HStack,
  useRadioGroup
} from '@chakra-ui/react';
import Options from "../components/Options";
import useFetch from "../hooks/useFetch";
import { IOrder, ContractData, OptionType, OptionAction } from '../types';
import { RouteComponentProps } from "@reach/router";
import RadioCard from '../components/Radio';
import { getEnumKeys } from '../utils/helperMethods';

function OptionsView(props: RouteComponentProps) {

  const [option, setOption] = React.useState("Buy");
  const [optionType, setOptionType] = React.useState("Call");
  const [expiry, setExpiry] = React.useState("");

  const optionRows = [];

  const url = `http://localhost:8000/orders`;
  const {data} = useFetch<IOrder[]>(url);

  const contractsUrl = 'http://localhost:8000/contracts';
  const {data: contractData} = useFetch<ContractData>(contractsUrl);

  const options: string[] = [OptionAction.BUY, OptionAction.SELL]
  const optionTypes: string[] = getEnumKeys(OptionType)
  let expiryDates: string[] = [""]

  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps, } = useRadioGroup({
    name: "option",
    defaultValue: "Buy",
    onChange: (nextValue) => setOption(nextValue),
  })

  const {
    getRootProps: getOptionTypeRootProps,
    getRadioProps: getOptionTypeRadioProps,
  } = useRadioGroup({
    name: "optionType",
    defaultValue:  "CALL",
    onChange: (nextValue) => setOptionType(nextValue),
  });

  const {
    getRootProps: getExpiryRootProps,
    getRadioProps: getExpiryRadioProps,
  } = useRadioGroup({
    name: "expiry",
    defaultValue:  "Aug21",
    onChange: (nextValue) => setExpiry(nextValue),
  });

  console.log();
  const groupOption = getOptionRootProps();
  const groupOptionType = getOptionTypeRootProps();
  const groupExpiry = getExpiryRootProps();


  if (contractData) {
    expiryDates = Object.keys(contractData["ETH-FK"]);
  }

  for (let i = 1900; i <= 3000; i += 100) {
    const filteredOrders = data && data.filter((order) => order.strike === i);
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
      <Options
        key={i}
        strikePrice={i}
        bid={bestBid}
        ask={bestAsk}
        isBuy={option === "Buy"}
        isCall={optionType === "Call"}
        setOption={setOption}
        setOptionType={setOptionType}
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
    >
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
      <Grid pb={"5"} templateColumns="repeat(2, 1fr)">
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
      </Grid>
      {optionRows}
    </Container>
  );
}

export default OptionsView;
