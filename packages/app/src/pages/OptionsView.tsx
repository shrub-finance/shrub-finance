import React, {useContext, useEffect, useReducer, useState} from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Container,
  Flex, Heading,
  HStack,
  Link,
  Spacer,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useRadioGroup, useToast
} from '@chakra-ui/react';
import OptionRow from "../components/OptionRow";
import useFetch from "../hooks/useFetch";
import {
  AppCommon,
  AppOrderSigned,
  ContractData,
  IndexedAppOrderSigned,
  IndexedAppOrderSignedNumbered,
  LastOrders,
  OrderCommon,
  PutCall,
  SellBuy
} from '../types';
import {RouteComponentProps} from "@reach/router";
import RadioCard from '../components/Radio';
import {
  cancelOrder,
  formatDate,
  formatStrike,
  fromEthDate,
  getAddress,
  getAddressFromSignedOrder,
  getAnnouncedEvents,
  getLastOrders,
  getMatchEvents,
  getPair,
  getUserNonce,
  hashOrderCommon,
  isBuyToOptionAction,
  matchEventToAppOrder,
  optionTypeToNumber,
  optionTypeToString,
  orderStatus,
  shortOptionName,
  subscribeToAnnouncements,
  transformOrderAppChain,
  unsubscribeFromAnnouncements,
} from "../utils/ethMethods";
import {BytesLike, ethers} from "ethers";
import {Icon} from '@chakra-ui/icons';
import {useWeb3React} from "@web3-react/core";
import {orderBookReducer} from "../components/orderBookReducer";
import {currencyIcon, currencySymbol, ExplorerDataType, explorerLink} from "../utils/chainMethods";
import {userOrdersReducer} from "../components/userOrdersReducer";
import {ToastDescription} from "../components/TxMonitoring";
import {TxContext} from "../components/Store";
import {handleErrorMessagesFactory} from "../utils/handleErrorMessages";
import {nonceReducer} from "../components/nonceReducer";

const initialOrderBookState = {};

function OptionsView(props: RouteComponentProps) {
  const {library, chainId, account} = useWeb3React();
  const sellBuys = ['BUY', 'SELL']
  const optionTypes = ['PUT', 'CALL']
  const [sellBuy, setSellBuy] = useState<SellBuy>('BUY');
  const [optionType, setOptionType] = useState<PutCall>('CALL');
  const [expiryDate, setExpiryDate] = useState<string>();
  const [strikePrices, setStrikePrices] = useState<{strikePrice: ethers.BigNumber, positionHash: string}[]>([]);
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [lastMatches, setLastMatches] = useState<LastOrders>({})
  const [orderBookState, orderBookDispatch] = useReducer(orderBookReducer, initialOrderBookState)
  const [userOrders, userOrderDispatch] = useReducer(userOrdersReducer, {})
  const [nonces, noncesDispatch] = useReducer(nonceReducer, {})
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [localError, setLocalError] = useState('');
  const [userMatches, setUserMatches] = useState<{buy: any[], sell: any[]}>({ buy: [], sell: []})
  const toast = useToast();

  const optionRows: JSX.Element[] = [];
  const userOrderRows: JSX.Element[] = [];

  // TODO un-hardcode this
  const quoteAsset = ethers.constants.AddressZero;
  const baseAsset = process.env.REACT_APP_FK_TOKEN_ADDRESS;

  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

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
    console.log('finding user matches')
  async function main() {
    if (!account || !library) {
      return;
    }
    const fromBlock = 0;
    const toBlock = 'latest';
    const buyMatches = await getMatchEvents({buyerAddress: account, provider: library, fromBlock, toBlock})
    const sellMatches = await getMatchEvents({sellerAddress: account, provider: library, fromBlock, toBlock})
    const processedBuyMatches = buyMatches.map(userEvent => matchEventToAppOrder(userEvent, 'BUY'));
    const processedSellMatches = sellMatches.map(userEvent => matchEventToAppOrder(userEvent, 'SELL'));
    setUserMatches({ buy: processedBuyMatches, sell: processedSellMatches });
  }
  main()
    .then(() => {})
    .catch(console.error);

  }, [account, library])


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

    function processEvent(event: any) {
      const appOrderSigned = processEventIntoAppOrderSigned(event)
      orderBookDispatch({type: 'add', orders: [appOrderSigned]})
    }

    async function getOrderData(positionHashes: BytesLike[]) {
      for (const positionHash of positionHashes) {
        subscribeToAnnouncements(library, positionHash, null, processEvent);
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

    return function cleanup() {
      if (!library) {
        return;
      }
      unsubscribeFromAnnouncements(library);
    }

  },[expiryDate, optionType, library]);

  useEffect(() => {
    if (!library) {
      return;
    }
    async function main() {
      console.log('running userOrders useEffect')
      const user = await getAddress(library);
      const userEvents = await getAnnouncedEvents({provider: library, user })
      const tempNonces: {[pair: string]: number} = {};
      for (const userEvent of userEvents) {
        const { args, transactionHash, blockNumber } = userEvent;
        const { common, order, user: address, sig } = args;
        const { baseAsset, quoteAsset, strike } = common;
        const { size, fee } = order;
        const { r, s, v } = sig;
        const pair = getPair(baseAsset, quoteAsset);
        const appCommon: OrderCommon = {
          ...common,
          expiry: common.expiry.toNumber(),
          optionType: common.optionType ? 1 : 0
        }
        if (!tempNonces[pair]) {
          const userPairNonce = await getUserNonce(user, appCommon, library);
          tempNonces[pair] = userPairNonce;
          noncesDispatch({type: 'update', user, pair, nonce: userPairNonce});
        }
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
        const appOrderSignedNumbered: IndexedAppOrderSignedNumbered = {
          baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, r, s, v, transactionHash, address, blockNumber
        }
        userOrderDispatch({type: 'add', order: appOrderSignedNumbered})
      }
    }

    main()
      .then(() => {})
      .catch(console.error)
  }, [library])

  userOrderRows.splice(0, userOrderRows.length)
  for (const [transactionHash, order] of Object.entries(userOrders)) {
    const { unitPrice, blockNumber, quoteAsset, baseAsset} = order;
    const pair = getPair(baseAsset, quoteAsset);
    let status;
    if (account) {
      const nonce = nonces[account] && nonces[account][pair]
      status = orderStatus(order, nonce, userMatches);
    } else {
      status = ''
    }
    userOrderRows.push(<Tr>
      <Td>
        <Link color={"gray"} fontSize={"sm"}
          href={explorerLink(chainId, blockNumber, ExplorerDataType.BLOCK)}> {blockNumber}
        </Link>
      </Td>
      <Td>{shortOptionName(order)}</Td>
      <Td isNumeric={true}>{unitPrice}</Td>
      <Td>{status}</Td>
      <Td>
        {
          status === 'active' &&
          <Button colorScheme="teal" size="xs" onClick={cancelOrderFunc.bind(null, order)}>
            Cancel
          </Button>
        }
      </Td>
    </Tr>)
  }

  function cancelOrderFunc(order: AppOrderSigned) {
    async function main() {
      const iOrder = transformOrderAppChain(order);
      const tx = await cancelOrder(iOrder, library);
      const description = `cancel order for ${shortOptionName(order)}`;
      pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
      try {
        const receipt = await tx.wait()
        const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
        toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
        pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
      } catch (e) {
        const toastDescription = ToastDescription(description, e.transactionHash, chainId);
        toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
        pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
      }
    }

    main()
      .then()
      .catch((err) => {
        handleErrorMessages({err});
        console.error(err)
      })

  }


  function processEventIntoAppOrderSigned(event: any) {
    const {common, positionHash, order, sig, eventInfo, user} = event;
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
    const address = user;
    appOrderSigned.address = address;
    return appOrderSigned;
  }

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
        <Heading mt={10}><Center><Icon as={currencyIcon(chainId)} pr="1"/> {currencySymbol(chainId)} Options</Center></Heading>

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
      <Container
        mt={50}
        p={5}
        shadow={useColorModeValue("2xl", "2xl")}
        flex="1"
        borderRadius="2xl"
        bg={useColorModeValue("white", "shrub.100")}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Block Number</Th>
              <Th>Option</Th>
              <Th isNumeric>Price per Contract</Th>
              <Th>Status</Th>
              <Th>Cancel</Th>
            </Tr>
          </Thead>
          <Tbody>
            {userOrderRows}
          </Tbody>
        </Table>
      </Container>
      </>
  );
}

export default OptionsView;
