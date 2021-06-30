import React from "react";
import {
  Stack,
  Select,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { Currencies } from "../constants/currencies";

const currencySymbols = [] as Array<JSX.Element>;
for (const currency of Object.keys(Currencies)) {
  currencySymbols.push(
    <option key={currency} value={currency}>
      {currency}
    </option>
  );
}

function UpdatePositions({
  value,
  setValue,
  modalCurrency,
  setModalCurrency,
  walletBalance,
  shrubBalance,
  action,
}: any) {
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");

  function fillSendMax() {
    if (action === "Deposit") {
      setValue(walletBalance[modalCurrency]);
    } else if (action === "Withdraw") {
      setValue(shrubBalance[modalCurrency]);
    }
  }

  return (
    <div>
      <Stack direction={["column"]} spacing="40px" mb="40px">
        <FormControl id="currency">
          <FormLabel>Currency</FormLabel>
          <Select
            size="lg"
            onChange={(event) => setModalCurrency(event.target.value)}
          >
            {currencySymbols}
          </Select>
        </FormControl>
        <FormControl id="amount">
          <FormLabel>Amount</FormLabel>
          <NumberInput
            onChange={(valueString) => setValue(parse(valueString))}
            value={format(value)}
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
    </div>
  );
}

export default UpdatePositions;
