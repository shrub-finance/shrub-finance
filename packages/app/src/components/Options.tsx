import React from "react";
import RadioCard from "./Radio";
import { FaEthereum } from "react-icons/fa";
import { GetOrders, postOrder } from "../utils/requests";
import {
  Text,
  Grid,
  Box,
  Button,
  Divider,
  Tag,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  FormLabel,
  NumberInputField,
  NumberInput,
  Stack,
  HStack,
  useRadioGroup,
} from "@chakra-ui/react";

import {
  signOrder,
  toEthDate,
  getAddressFromSignedOrder,
  getUserNonce,
  validateOrderAddress,
  getAvailableBalance,
  matchOrder
} from "../utils/ethMethods";
import { Icon } from "@chakra-ui/icons";
import { OptionAction, OptionType } from '../types';
import {useWeb3React} from "@web3-react/core";
import { getEnumKeys } from '../utils/helperMethods';

const quoteAsset = "0x0000000000000000000000000000000000000000"; // ETH
const baseAsset: string = process.env.REACT_APP_FK_TOKEN_ADDRESS || ""; // FK

if (!baseAsset) {
  throw new Error(
    "configuration missing. Please specify REACT_APP_FK_TOKEN_ADDRESS in .env file"
  );
}

const height = 100;

// TODO: setOption and setOptionType should be maintained through context
function Options({
  strikePrice,
  isCall,
  isBuy,
  last,
  ask,
  bid,
  setOption,
  setOptionType,
}: any) {
  const expiryDate = "2021-11-01";
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [amount, setAmount] = React.useState(1);
  const [price, setPrice] = React.useState(0);

  // Radio logic
  const options: string[] = [OptionAction.BUY, OptionAction.SELL]
  const optionType: string[] = getEnumKeys(OptionType)

  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: isBuy ? "BUY" : "SELL",
    onChange: (nextValue) => setOption(nextValue),
  });

  const {
    getRootProps: getOptionTypeRootProps,
    getRadioProps: getOptionTypeRadioProps,
  } = useRadioGroup({
    name: "optionType",
    defaultValue: isCall ? "CALL" : "PUT",
    onChange: (nextValue) => setOptionType(nextValue),
  });

  const groupOption = getOptionRootProps();
  const groupOptionType = getOptionTypeRootProps();
  const { active, library, account } = useWeb3React();

  async function placeOrder() {
    if (!active || !account) {
      console.error('Please connect your wallet');
      return;
    }
    const now = new Date();
    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setUTCDate(oneWeekFromNow.getUTCDate() + 7);
    const nonce =
      (await getUserNonce({
        address: account,
        quoteAsset,
        baseAsset,
      }, library)) + 1;
    const unsignedOrder = {
      size: amount,
      isBuy,
      optionType: isCall ? 1 : 0,
      baseAsset,
      quoteAsset,
      expiry: toEthDate(new Date(expiryDate)),
      strike: strikePrice,
      price,
      fee: 0,
      offerExpire: toEthDate(oneWeekFromNow),
      nonce,
    };
    try {
      const signedOrder = await signOrder(unsignedOrder, library);
      const verifiedAddress = await getAddressFromSignedOrder(signedOrder, library);
      console.log(`verifiedAddress: ${verifiedAddress}`);
      await postOrder(signedOrder);
    } catch (e) {
      console.error(e);
    }
  }

  async function matchOrderRow() {
    if (!active || !account) {
      console.error('Please connect your wallet');
      return;
    }
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now);
    fifteenMinutesFromNow.setUTCMinutes(now.getUTCMinutes() + 15);
    const order = await GetOrders({});
    console.log(order);
    if (!order) {
      console.log("no orders found");
      return;
    }
    try {
      console.log(order);
      const doesAddressMatch: boolean = await validateOrderAddress(order, library);
      console.log(doesAddressMatch);
      const {
        address,
        baseAsset,
        quoteAsset,
        nonce,
        price,
        optionType,
        strike,
        size,
        isBuy,
        expiry,
      } = order;
      const userNonce = await getUserNonce({
        address,
        quoteAsset,
        baseAsset,
      }, library);
      console.log(userNonce);
      console.log(nonce);
      // if (userNonce !== nonce) {
      //   throw new Error("nonce does not match");
      // }
      if (optionType === OptionType.CALL) {
        // required collateral is strike * size of the quoteAsset
        const balance = await getAvailableBalance({
          address,
          tokenContractAddress: quoteAsset,
          provider: library
        });
        console.log(balance);
        if (balance.lt(strike * size)) {
          throw new Error("not enough collateral of quoteAsset");
        }
      } else {
        // required collateral is strike * size of the baseAsset
        const balance = await getAvailableBalance({
          address,
          tokenContractAddress: quoteAsset,
          provider: library
        });
        console.log(balance.toString());
        if (balance.lt(strike * size)) {
          throw new Error("not enough collateral of baseAsset");
        }
      }
      // Get the user nonce
      const signerNonce =
        (await getUserNonce({
          address: account,
          quoteAsset,
          baseAsset,
        }, library)) + 1;
      console.log(`signerNonce: ${signerNonce}`);
      // Get other stuff needed for the order
      console.log(`isBuy: ${isBuy}`);
      console.log(`!isBuy: ${!isBuy}`);
      const unsignedOrder = {
        size,
        isBuy: !isBuy,
        optionType,
        baseAsset,
        quoteAsset,
        expiry,
        strike,
        price,
        fee: 0,
        offerExpire: toEthDate(fifteenMinutesFromNow),
        nonce: signerNonce,
      };
      const signedOrder = await signOrder(unsignedOrder, library);
      console.log(signedOrder);
      const result = await matchOrder({
        signedBuyOrder: signedOrder,
        signedSellOrder: order,
      }, library);
      console.log("result");
      console.log(result);
      // Create the buy order and sign it
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Box>
      <Divider mb={5} />
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <Box h={height}>
          <Text fontSize={"2xl"} pb={3}>
            ${strikePrice}
          </Text>
          <Tag size={"sm"} colorScheme="teal">
            {isCall ? "CALL" : "PUT"}
          </Tag>
        </Box>
        <Box h={height}>
          <Text fontSize={"sm"}>Last: ${last}</Text>
          <Text fontSize={"sm"}>Ask: ${ask}</Text>
          <Text fontSize={"sm"}>Bid: ${bid}</Text>
        </Box>
        <Box h={height}>
          <Stack spacing={4} direction="row" align="center">
            <Button colorScheme="teal" onClick={onOpen} size="sm">
              {isBuy ? "Limit Buy" : "Limit Sell"}
            </Button>
            <Button colorScheme="teal" onClick={matchOrderRow} size="sm">
              {isBuy ? "Market Buy" : "Market Sell"}
            </Button>
          </Stack>
        </Box>
      </Grid>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Order Details</DrawerHeader>
          <DrawerBody>
            <Stack spacing="24px">
              <Box mt={4}>
                <Tag>
                  <Icon as={FaEthereum} />
                  ETHEREUM
                </Tag>
              </Box>
              <Box>
                <FormLabel htmlFor="strike">Strike:</FormLabel>
                <NumberInput id="strike" isDisabled={true} value={strikePrice}>
                  <NumberInputField />
                </NumberInput>
              </Box>
              <Box>
                <HStack {...groupOptionType}>
                  <FormLabel htmlFor="optionType">Option Type:</FormLabel>
                  {optionType.map((value) => {
                    const radio = getOptionTypeRadioProps({ value });
                    return (
                      <RadioCard key={value} {...radio}>
                        {value}
                      </RadioCard>
                    );
                  })}
                </HStack>
              </Box>
              <Box>
                <FormLabel htmlFor="expiryDate">Expiry Date:</FormLabel>
                <Input id="expiry" value={expiryDate} isDisabled={true} />
              </Box>
              <Box>
                <HStack>
                  <Divider orientation="horizontal" mb={3} mt={3} />
                </HStack>
              </Box>
              <Box>
                <HStack {...groupOption}>
                  <FormLabel htmlFor="option">Option:</FormLabel>
                  {options.map((value) => {
                    const radio = getOptionRadioProps({ value });
                    return (
                      <RadioCard key={value} {...radio}>
                        {value}
                      </RadioCard>
                    );
                  })}
                </HStack>
              </Box>
              <Box>
                <FormLabel htmlFor="amount">Amount:</FormLabel>
                <Input
                  id="amount"
                  placeholder="0"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                />
              </Box>
              <Box>
                <FormLabel htmlFor="bid">Price:</FormLabel>
                <Input
                  id="bid"
                  placeholder="0"
                  value={price}
                  onChange={(event) => setPrice(Number(event.target.value))}
                />
              </Box>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" type="submit" onClick={placeOrder}>
              Place Order
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Options;
