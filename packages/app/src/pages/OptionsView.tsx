import React, { useEffect, useState } from 'react';
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

  const [option, setOption] = useState("BUY");
  const [optionType, setOptionType] = useState("CALL");
  const [expiryDate, setExpiryDate] = useState("");
  const [strikePrices, setStrikePrices] = useState([]);
  const [expiryDates, setExpiryDates] = useState([]);

  const optionRows: any = [];

  const url = `http://localhost:8000/orders`;
  const {data} = useFetch<IOrder[]>(url);

  const contractsUrl = 'http://localhost:8000/contracts';
  // TODO: useFetch also provides state error, that we should handle
  const {data: contractData, status: contractDataStatus} = useFetch<ContractData>(contractsUrl);

  const options: string[] = [OptionAction.BUY, OptionAction.SELL]
  const optionTypes: string[] = getEnumKeys(OptionType)


  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: "BUY",
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
    name: "expiryDate",
    onChange: (nextValue) => setExpiryDate(nextValue),
  });


  const groupOption = getOptionRootProps();
  const groupOptionType = getOptionTypeRootProps();
  const groupExpiry = getExpiryRootProps();


  useEffect(() => {
    if (contractData && contractDataStatus === "fetched") {
      console.log(contractData);
      console.log(contractDataStatus);

      // @ts-ignore
      const expiryDatesLocal = Object.keys(contractData["ETH-FK"]);
      // @ts-ignore
      setExpiryDates(expiryDatesLocal);

      if(!expiryDate) {
        setExpiryDate(expiryDatesLocal[0])
      }
    }
      }, [contractDataStatus]

  );


  useEffect(() => {
    if(expiryDate) {
      // @ts-ignore
      setStrikePrices(contractData["ETH-FK"][expiryDate][optionType]);
    }

  },[expiryDate, optionType]);


  for (const strikePrice of strikePrices) {
    const filteredOrders = data && data.filter((order) =>
        // @ts-ignore
    order.strike === strikePrice && order.optionType === OptionType[optionType]
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
      <Options
        key={strikePrice}
        strikePrice={strikePrice}
        bid={bestBid}
        ask={bestAsk}
        isBuy={option === "BUY"}
        isCall={optionType === "CALL"}
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
