import React from "react";
import {
  Stack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField, useRadioGroup, Alert, AlertIcon, SlideFade, InputRightElement
} from "@chakra-ui/react";
import { Currencies } from "../constants/currencies";
import RadioCard from "./Radio";

function WithdrawDeposit({
  amountValue,
  setAmountValue,
  modalCurrency,
  setModalCurrency,
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
    defaultValue: modalCurrency,
    onChange: (nextValue) => setModalCurrency(nextValue)
  })

  const currenciesRadiogroup = getRootProps()

  function fillSendMax() {
    if (action === "Deposit") {
      setAmountValue(walletBalance[modalCurrency]);
    } else if (action === "Withdraw") {
      setAmountValue(shrubBalance.available[modalCurrency]);
    }
  }

  return (
      <Stack direction={["column"]} spacing="40px" mb="40px">
        {error && (
            <SlideFade in={true} unmountOnExit={true}>
            <Alert status="warning" borderRadius={9} >
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
                value={format(amountValue)} size="lg"
            >
            <NumberInputField/>
            <InputRightElement width="auto">
              <Button size="xs" onClick={fillSendMax} p={3.5} mr={2} >
                Send Max
              </Button>
            </InputRightElement>
          </NumberInput>
        </FormControl>
      </Stack>
  );
}

export default WithdrawDeposit;