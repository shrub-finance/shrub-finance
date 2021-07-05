import React from "react";
import {
  Stack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField, useRadioGroup, Alert, AlertIcon, SlideFade
} from "@chakra-ui/react";
import { Currencies } from "../constants/currencies";
import RadioCard from "./Radio";

function WithdrawDeposit({
  amountValue,
  setAmountValue,
  drawerCurrency,
  setDrawerCurrency,
  walletBalance,
  shrubBalance,
  action,
  error
}: any) {
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");

  // radio butttons
  const currencies = Object.keys(Currencies)

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "currency",
    defaultValue: drawerCurrency,
    onChange: (nextValue) => setDrawerCurrency(nextValue)
  })

  const currenciesRadiogroup = getRootProps()

  function fillSendMax() {
    if (action === "Deposit") {
      setAmountValue(walletBalance[drawerCurrency]);
    } else if (action === "Withdraw") {
      setAmountValue(shrubBalance[drawerCurrency]);
    }
  }

  return (

      <Stack direction={["column"]} spacing="40px" mb="40px">
        {error && (
            <SlideFade in={true} unmountOnExit={true}>
            <Alert status="warning" borderRadius={9}>
              <AlertIcon />
              {error}
            </Alert>
            </SlideFade>
        )
        }
        <HStack {...currenciesRadiogroup}>
          {currencies.map((value) => {
            const radio = getRadioProps({ value })
            return (
                <RadioCard key={value} {...radio}>
                  {value}
                </RadioCard>
            )
          })}
        </HStack>
        <FormControl id="amount">
          <FormLabel>Amount</FormLabel>
          <NumberInput
            onChange={(valueString) => setAmountValue(parse(valueString))}
            value={format(amountValue)}
            size="lg"
          >
            <NumberInputField />
          </NumberInput>
          <Button
              colorScheme="orange"
              size="xs"
              variant="outline"
              mt="10px"
              ml="72%"
              onClick={fillSendMax}
          >
            Send Max
          </Button>
        </FormControl>
      </Stack>
  );
}

export default WithdrawDeposit;
