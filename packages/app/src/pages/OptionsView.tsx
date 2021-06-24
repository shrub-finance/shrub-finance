import React from "react";
import { Container, Grid, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import Options from "../components/Options";
import useFetch from "../hooks/useFetch";
import { IOrder } from "../types";
import { RouteComponentProps } from "@reach/router";

function OptionsView(props: RouteComponentProps) {
  const [option, setOption] = React.useState("Buy");
  const [optionType, setOptionType] = React.useState("Call");
  const optionRows = [];

  const url = `http://localhost:8000/orders`;
  const {data} = useFetch<IOrder[]>(url);
  // TODO: This will come from backend
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
      <Grid pb={"5"} templateColumns="repeat(2, 1fr)">
        <RadioGroup onChange={(e) => setOption(e.toString())} value={option}>
          <Stack direction="row">
            <Radio value="Buy">Buy</Radio>
            <Radio value="Sell">Sell</Radio>
          </Stack>
        </RadioGroup>
        <RadioGroup
          onChange={(e) => setOptionType(e.toString())}
          value={optionType}
        >
          <Stack direction="row">
            <Radio value="Call">Call</Radio>
            <Radio value="Put">Put</Radio>
          </Stack>
        </RadioGroup>
      </Grid>
      {optionRows}
    </Container>
  );
}

export default OptionsView;
