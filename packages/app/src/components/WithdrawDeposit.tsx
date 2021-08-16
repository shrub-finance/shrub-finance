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
import {useWeb3React} from "@web3-react/core";
import {getWalletBalance} from "../utils/ethMethods";
import {ShrubBalance, SupportedCurrencies} from "../types";

function WithdrawDeposit({
  amountValue,
  setAmountValue,
  modalCurrency,
  setModalCurrency,
  shrubBalance,
  withdrawDepositAction,
  error
}: {
  amountValue: string,
  setAmountValue: React.Dispatch<React.SetStateAction<string>>,
  modalCurrency: SupportedCurrencies,
  setModalCurrency: React.Dispatch<React.SetStateAction<SupportedCurrencies>>,
  shrubBalance: ShrubBalance,
  withdrawDepositAction: string,
  error: string
}) {
  const { library } = useWeb3React();
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");

  // radio buttons
  const currencies = Object.keys(Currencies)

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "currency",
    defaultValue: modalCurrency,
    onChange: (value: SupportedCurrencies) => setModalCurrency(value)
  })

  const currenciesRadiogroup = getRootProps()
// TODO: give feedback if entered amount more than the max while being typed
  async function fillSendMax() {
    if (withdrawDepositAction === "Deposit") {
      const walletBalanceValue = await getWalletBalance(Currencies[modalCurrency].address, library);
      setAmountValue(walletBalanceValue);
    } else if (withdrawDepositAction === "Withdraw") {
      setAmountValue(String(shrubBalance.available[modalCurrency]));
    }
  }

  return (
      <Stack direction={["column"]} spacing="40px" mb="40px">
        {error && (
            <SlideFade in={true} unmountOnExit={true}>
            <Alert status="error" borderRadius={9} >
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
