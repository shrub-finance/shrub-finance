import React, {useState} from "react";
import RadioCard from "./Radio";
import {FaEthereum} from "react-icons/fa";
import {getOrders, postOrder} from "../utils/requests";

import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
  Grid,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  Tag,
  Text,
  useDisclosure,
  useRadioGroup,
} from "@chakra-ui/react";

import {
  formatOrder,
  getAddressFromSignedOrder,
  getAvailableBalance,
  getUserNonce,
  matchOrder,
  orderWholeUnitsToBaseUnits,
  signOrder,
  toEthDate,
  validateOrderAddress
} from "../utils/ethMethods";
import {Icon} from "@chakra-ui/icons";
import {OptionAction, OptionType} from '../types';
import {useWeb3React} from "@web3-react/core";
import {getEnumKeys} from '../utils/helperMethods';

const quoteAsset = "0x0000000000000000000000000000000000000000"; // ETH
const baseAsset: string = process.env.REACT_APP_FK_TOKEN_ADDRESS || ""; // FK

if (!baseAsset) {
  throw new Error(
    "Configuration missing. Please specify REACT_APP_FK_TOKEN_ADDRESS in .env file"
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
  option,
  optionType,
  expiryDate
}: any) {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [amount, setAmount] = React.useState(1);
  const [price, setPrice] = React.useState('');

  // TODO: get proper status response from postOrder method to show loading state on Place Order button
  const [submitting, setSubmitting] = React.useState(false);

  // Radio logic
  const radioOptions: string[] = getEnumKeys(OptionAction)
  const radioOptionsType: string[] = getEnumKeys(OptionType)
  const [radioOption, setRadioOption] = useState(option);
  const [radioOptionType, setRadioOptionType] = useState(optionType);

  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: option,
    // @ts-ignore
    onChange: (nextValue) => setRadioOption(nextValue),
  });

  const {
    getRootProps: getOptionTypeRootProps,
    getRadioProps: getOptionTypeRadioProps,
  } = useRadioGroup({
    name: "optionType",
    defaultValue: optionType,
    // @ts-ignore
    onChange: (nextValue) => setRadioOptionType(nextValue),
  });

  const groupOption = getOptionRootProps();
  const groupOptionType = getOptionTypeRootProps();
  const { active, library, account } = useWeb3React();

  function closeDrawer() {
    setSubmitting(false);
    onClose();
  }

  async function placeOrder() {
    setSubmitting(true);
    if (!active || !account) {
      console.error('Please connect your wallet');
      setSubmitting(false);
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
      isBuy: radioOption === OptionAction.BUY,
      optionType: radioOptionType,
      baseAsset,
      quoteAsset,
      expiry: toEthDate(new Date(expiryDate)),
      strike: strikePrice,
      price: Number(price) || 0,
      fee: 0,
      offerExpire: toEthDate(oneWeekFromNow),
      nonce,
    };
    try {
      const signedOrder = await signOrder(orderWholeUnitsToBaseUnits(unsignedOrder), library);
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
    const order = await getOrders({});
    console.log(order);
    if (!order) {
      console.log("no orders found");
      return;
    }
    try {
      console.log(order);
      const formattedOrder = formatOrder(order);
      console.log(formattedOrder);
      const doesAddressMatch: boolean = await validateOrderAddress(formattedOrder, library);
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
      } = formattedOrder;
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
        console.log(size)
        if (balance.lt(size)) {
          throw new Error("not enough collateral of quoteAsset");
        }
      } else {
        // required collateral is strike * size of the baseAsset
        const balance = await getAvailableBalance({
          address,
          tokenContractAddress: baseAsset,
          provider: library
        });
        console.log(balance.toString());
        if (balance.lt(price)) {
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
      console.log(`optionType: ${optionType}`)
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
      const signedSellOrder = {
            ...formattedOrder,
            price: formattedOrder.price.toString(),
            size: formattedOrder.size.toString(),
            strike: formattedOrder.strike.toString()
          };
      const result = await matchOrder({
        signedBuyOrder: signedOrder,
        signedSellOrder
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
            {isCall ? OptionType.CALL : OptionType.PUT}
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
                  {radioOptionsType.map((value) => {
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
                  {radioOptions.map((value) => {
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
                  onChange={(event: any) => setAmount(event.target.value)}
                />
              </Box>
              <Box>
                <FormLabel htmlFor="bid">Price:</FormLabel>
                <Input
                  id="bid"
                  placeholder="0"
                  value={price}
                  onChange={(event: any) => setPrice(event.target.value)}
                />
              </Box>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={closeDrawer}>
              Cancel
            </Button>
            <Button
                colorScheme="teal"
                type="submit"
                onClick={placeOrder}
                isLoading={submitting}
                loadingText="Placing Order"
            >
              Place Order
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Options;
