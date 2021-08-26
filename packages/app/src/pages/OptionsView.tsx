import React, {useEffect, useReducer, useState} from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Center,
  Container,
  Flex, Heading,
  HStack,
  Spacer,
  Spinner,
  useColorModeValue,
  useRadioGroup
} from '@chakra-ui/react';
import OptionRow from "../components/OptionRow";
import useFetch from "../hooks/useFetch";
import {
  AppCommon,
  ContractData, IndexedAppOrderSigned,
  LastOrders,
  OrderCommon,
  PutCall,
  SellBuy
} from '../types';
import {RouteComponentProps} from "@reach/router";
import RadioCard from '../components/Radio';
import {
  formatDate,
  formatStrike,
  fromEthDate, getAddressFromSignedOrder, getAnnouncedEvents, getLastOrders,
  hashOrderCommon, isBuyToOptionAction, optionTypeToNumber, optionTypeToString, subscribeToAnnouncements,
  transformOrderAppChain, unsubscribeFromAnnouncements
} from "../utils/ethMethods";
import {BytesLike, ethers} from "ethers";
import {FaEthereum} from "react-icons/fa";
import {Icon} from '@chakra-ui/icons';
import {useWeb3React} from "@web3-react/core";
import {orderBookReducer} from "../components/orderBookReducer";

const initialOrderBookState = {};

function OptionsView(props: RouteComponentProps) {
  const {library} = useWeb3React();
  const sellBuys = ['BUY', 'SELL']
  const optionTypes = ['PUT', 'CALL']
  const [sellBuy, setSellBuy] = useState<SellBuy>('BUY');
  const [optionType, setOptionType] = useState<PutCall>('CALL');
  const [expiryDate, setExpiryDate] = useState<string>();
  const [strikePrices, setStrikePrices] = useState<{strikePrice: ethers.BigNumber, positionHash: string}[]>([]);
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [lastMatches, setLastMatches] = useState<LastOrders>({})
  const [orderBookState, orderBookDispatch] = useReducer(orderBookReducer, initialOrderBookState)

  const optionRows: JSX.Element[] = [];

  // TODO un-hardcode this
  const quoteAsset = ethers.constants.AddressZero;
  const baseAsset = process.env.REACT_APP_FK_TOKEN_ADDRESS;

  if (!quoteAsset || !baseAsset) {
    throw new Error('missing quoteAsset or baseAsset');
  }

  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: sellBuy,
    onChange: (nextValue: SellBuy) => setSellBuy(nextValue),
  })

  const {
    getRootProps: getOptionTypeRootProps,
    getRadioProps: getOptionTypeRadioProps,
  } = useRadioGroup({
    name: "optionType",
    defaultValue: optionType,
    onChange: (nextValue: PutCall) => setOptionType(nextValue),
  });

  const {
    getRootProps: getExpiryRootProps,
    getRadioProps: getExpiryRadioProps,
  } = useRadioGroup({
    name: "expiryDate",
    defaultValue: '',
    onChange: (nextValue) => setExpiryDate(nextValue),
  });

  const groupOption = getOptionRootProps();
  const groupOptionType = getOptionTypeRootProps();
  const groupExpiry = getExpiryRootProps();

  const contractsUrl = `${process.env.REACT_APP_API_ENDPOINT}/contracts`;
  const {error:contractDataError, data: contractData, status: contractDataStatus} = useFetch<ContractData>(contractsUrl);

  // On load
  useEffect(() => {
    console.log('running onLoad useEffect')
    if (!library) {
      return;
    }
    getLastOrders(library)
      .then(lasts => {
        setLastMatches(lasts)
      })
      .catch(console.error);
  }, [library]);

  useEffect(() => {
      if (contractData && contractDataStatus === "fetched" && !contractDataError) {
        const expiryDatesString = Object.keys(contractData["ETH-FK"]);
        console.log(expiryDatesString);
        console.log(contractData);
        setExpiryDates(expiryDatesString);
        if(!expiryDate) {
          setExpiryDate(expiryDatesString[0]);
        }
      }
      }, [contractDataStatus]);

  useEffect(() => {
    const subscriptionPositionHashes = [];
    if(!contractData || !expiryDate || !library) {
      return;
    }
    const strikeObjPrices = contractData['ETH-FK'][expiryDate][optionType].map((strikeNum) => {
      const strike = ethers.BigNumber.from(strikeNum);
      const common: OrderCommon = {
        baseAsset,
        quoteAsset,
        expiry: Number(expiryDate),
        strike,
        optionType: optionTypeToNumber(optionType)
      }
      const positionHash = hashOrderCommon(common)
      return { strikePrice: strike, positionHash };
    })
    getOrderData(strikeObjPrices.map(s => s.positionHash))
      .then(() => setStrikePrices(strikeObjPrices))
      .catch(e => console.error(`Something went wrong with the orderbook: ${e}`));


    async function getOrderData(positionHashes: BytesLike[]) {
      for (const positionHash of positionHashes) {
        subscribeToAnnouncements(library, positionHash, processEvent);
        subscriptionPositionHashes.push(positionHash)
        const eventsForHash = await getAnnouncedEvents({provider: library, positionHash})
        const formattedEventsForHash: IndexedAppOrderSigned[] = [];
        for (const event of eventsForHash) {
          const { args, transactionHash } = event;
          const { common, order, sig } = args;
          const { baseAsset, quoteAsset, strike } = common;
          const { size, fee } = order;
          const { r, s, v } = sig;

          const expiry = fromEthDate(common.expiry.toNumber());
          const optionType = optionTypeToString(common.optionType);
          const formattedExpiry = expiry.toLocaleDateString('en-us', {month: "short", day: "numeric"});
          const formattedStrike = ethers.utils.formatUnits(strike, 6);  // Need to divide by 1M to get the actual strike
          const nonce = order.nonce.toNumber();
          const formattedSize = ethers.utils.formatUnits(size, 18);
          const optionAction = isBuyToOptionAction(order.isBuy);
          const totalPrice = ethers.BigNumber.from(order.price);
          const unitPrice = Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
          const offerExpire = fromEthDate(order.offerExpire.toNumber());
          const formattedFee = ethers.utils.formatUnits(fee, 18);
          const appOrderSigned: IndexedAppOrderSigned = {
            baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, r, s, v, transactionHash
          }
          const iOrder = transformOrderAppChain(appOrderSigned)
          const address = await getAddressFromSignedOrder(iOrder, library);
          appOrderSigned.address = address;
          formattedEventsForHash.push(appOrderSigned);
        }
        orderBookDispatch({type: 'add', orders: formattedEventsForHash})
      }
    }

    async function processEvent(event: any) {
      const {common, positionHash, order, sig, eventInfo} = event;
      const { baseAsset, quoteAsset, strike } = common;
      const { size, fee } = order;
      const { r, s, v } = sig;
      const { transactionHash } = eventInfo;

      const expiry = fromEthDate(common.expiry.toNumber());
      const optionType = optionTypeToString(common.optionType);
      const formattedExpiry = expiry.toLocaleDateString('en-us', {month: "short", day: "numeric"});
      const formattedStrike = ethers.utils.formatUnits(strike, 6);  // Need to divide by 1M to get the actual strike
      const nonce = order.nonce.toNumber();
      const formattedSize = ethers.utils.formatUnits(size, 18);
      const optionAction = isBuyToOptionAction(order.isBuy);
      const totalPrice = ethers.BigNumber.from(order.price);
      const unitPrice = Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
      const offerExpire = fromEthDate(order.offerExpire.toNumber());
      const formattedFee = ethers.utils.formatUnits(fee, 18);
      const appOrderSigned: IndexedAppOrderSigned = {
        baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, r, s, v, transactionHash
      }
      const iOrder = transformOrderAppChain(appOrderSigned)
      const address = await getAddressFromSignedOrder(iOrder, library);
      appOrderSigned.address = address;
      orderBookDispatch({type: 'add', orders: [appOrderSigned]})
    }

    return function cleanup() {
      if (!library) {
        return;
      }
      unsubscribeFromAnnouncements(library);
    }

  },[expiryDate, optionType, library]);

  for (const {strikePrice} of strikePrices) {
    const niceExpiry = formatDate(fromEthDate(Number(expiryDate)));
    const appCommon:AppCommon = {
      formattedStrike: formatStrike(strikePrice),
      formattedExpiry: formatDate(Number(expiryDate)),
      optionType,
      quoteAsset,
      baseAsset,
      expiry: fromEthDate(Number(expiryDate)),
      strike: strikePrice
    }

    if (
      !expiryDate ||
      !orderBookState ||
      !orderBookState[quoteAsset] ||
      !orderBookState[quoteAsset][baseAsset] ||
      !orderBookState[quoteAsset][baseAsset][niceExpiry] ||
      !orderBookState[quoteAsset][baseAsset][niceExpiry][optionType] ||
      !orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()]
    ) {
      const emptyOptionData = {
        buyOrdersIndexed: {},
        sellOrdersIndexed: {},
        buyOrders: [],
        sellOrders: [],
        last: ''
      }
      optionRows.push(
        <OptionRow appCommon={appCommon} option={sellBuy} last={''} ask={''} bid={''} key={appCommon.formattedStrike} optionData={emptyOptionData} />
      );
      continue;
    }

    const optionData = orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()];
    const bestBid = orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()].bid?.toFixed(2) || '';
    const bestAsk = orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()].ask?.toFixed(2) || '';


    const orderCommon: OrderCommon = {
      baseAsset,
      quoteAsset,
      expiry: Number(expiryDate),
      strike: strikePrice,
      optionType: optionTypeToNumber(optionType)
    }
    const positionHash = hashOrderCommon(orderCommon)
    const last = lastMatches[positionHash] ? String(lastMatches[positionHash]) : ' -';

    optionRows.push(
      <OptionRow appCommon={appCommon} option={sellBuy} last={last} ask={bestAsk} bid={bestBid} key={appCommon.formattedStrike} optionData={optionData} />
    );
  }
  return (
      <>
        <Heading mt={10}><Center><Icon as={FaEthereum} /> ETH Options</Center></Heading>

  <Container
      mt={50}
      p={5}
      shadow={useColorModeValue("2xl", "2xl")}
      flex="1"
      borderRadius="2xl"
      bg={useColorModeValue("white", "shrub.100")}
    >
      {contractDataStatus === "fetching" &&
      <Center >
        <Spinner color="bud.100" size="xl"/>
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
          {expiryDates.map((expiry) => {
            const radio = getExpiryRadioProps({ value: expiry });
            return (
                (Number(expiry)*1000) > Date.now() &&
                  <RadioCard key={expiry} {...radio}>
                    {formatDate(Number(expiry))}
                  </RadioCard>
            );
          })}
          {/* do not delete, leave it commented out for now*/}
          {/*<RadioCard>*/}
          {/*  Special Dates*/}
          {/*  <Tooltip p={3} label="Own the future. This date picker let's you pick important upcoming events in ETH land as your expiry. " fontSize="xs" borderRadius="lg" bg="shrub.300" color="white">*/}
          {/*  <Text as="sup" pl={1}><QuestionOutlineIcon/></Text>*/}
          {/*</Tooltip>*/}
          {/*</RadioCard>*/}
        </HStack>
      </Box>
        <Flex mb={10}>
            <HStack {...groupOption}>
              {sellBuys.map((value) => {
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
      </>
  );
}

export default OptionsView;
