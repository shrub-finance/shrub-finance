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
  Text,
  Spacer,
  Spinner,
  Table, Tag, TagLabel,
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
  AppCommon, AppOrder,
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
  getAnnouncedEvents, getBlockNumber,
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
  subscribeToAnnouncements, toEthDate,
  transformOrderAppChain,
  unsubscribeFromAnnouncements,
} from '../utils/ethMethods'
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
import SummaryView from '../components/SummaryView'
import {HelloBud} from "../assets/Icons";
import {useQuery} from "@apollo/client";
import { ORDER_HISTORY_QUERY, SUMMARY_VIEW_QUERY } from '../constants/queries'
import contractData from "../constants/common"

const initialOrderBookState = {};
const DEPLOY_BLOCKHEIGHT = process.env.REACT_APP_DEPLOY_BLOCKHEIGHT;
const MAX_SCAN_BLOCKS = Number(process.env.REACT_APP_MAX_SCAN_BLOCKS);

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
  const boxShadow = useColorModeValue("2xl", "2xl");
  const backgroundColor = useColorModeValue("white", "shrub.100");
  const [optionRows, setOptionRows] = useState<JSX.Element[]>([]);
  const [userOrderRows, setUserOrderRows] = useState<JSX.Element[]>([]);

  // TODO un-hardcode this
  const quoteAsset = process.env.REACT_APP_SMATIC_TOKEN_ADDRESS;
  const baseAsset = process.env.REACT_APP_SUSD_TOKEN_ADDRESS;

  const { loading: summaryLoading, error: summaryError, data: summaryData } = useQuery(SUMMARY_VIEW_QUERY, {variables: {
      expiry: Number(expiryDate),
      optionType,
      baseAsset: baseAsset && baseAsset.toLowerCase(),
      quoteAsset: quoteAsset && quoteAsset.toLowerCase(),
      offerExpire: toEthDate(new Date())
    }
  });
  const { loading: orderHistoryLoading, error: orderHistoryError, data: orderHistoryData } = useQuery(ORDER_HISTORY_QUERY, {variables:{
      id: account && account.toLowerCase()
    }
  });

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

  // On Change of expiry of optionType
  useEffect(() => {
    console.log('summaryData changed');
    console.log(summaryData);
    const tempOptionRows:JSX.Element[] = [];
    const tempOptionMap:Map<string, JSX.Element> = new Map();
    const emptyOptionData = {
      buyOrdersIndexed: {},
      sellOrdersIndexed: {},
      buyOrders: [],
      sellOrders: [],
      last: ''
    }
    if (summaryData && summaryData.options) {
      for (const option of summaryData.options) {
        const { strike: decimalStrike, lastPrice, sellOrders, buyOrders, id } = option;
        console.log(`${decimalStrike} - last: ${lastPrice} - ask: ${sellOrders[0] && sellOrders[0].pricePerContract} - bid: ${buyOrders[0] && buyOrders[0].pricePerContract}`)
        const ask = (sellOrders[0] && sellOrders[0].pricePerContract) || '';
        const bid = (buyOrders[0] && buyOrders[0].pricePerContract) || '';
        const appCommon:AppCommon = {
          formattedStrike: decimalStrike,
          formattedExpiry: formatDate(Number(expiryDate)),
          optionType,
          quoteAsset,
          baseAsset,
          expiry: fromEthDate(Number(expiryDate)),
          // TODO: 18 should be the number of decimals
          strike: ethers.utils.parseUnits(decimalStrike, 6)
        }
        const optionData = {
          buyOrdersIndexed: {},
          sellOrdersIndexed: {},
          buyOrders: buyOrders.map((order: any) => {
            return {
              unitPrice: Number(order.pricePerContract),
              formattedSize: order.size,
              positionHash: order.option.id,
              user: order.userOption.user.id,
              blockHeight: order.block
            };
          }),
          sellOrders: sellOrders.map((order: any) => {
            return {
              unitPrice: Number(order.pricePerContract),
              formattedSize: order.size,
              positionHash: order.option.id,
              user: order.userOption.user.id,
              blockHeight: order.block
            };
          }),
          last: ''
        }
        tempOptionMap.set(
          ethers.utils.parseUnits(decimalStrike, 6).toString(),
          <OptionRow appCommon={appCommon} option={sellBuy} last={lastPrice} ask={ask} bid={bid} key={id} optionData={optionData} />
        );
      }
    }
    for (const strike of strikePrices) {
      console.log(strike.strikePrice.toString());
      const row = tempOptionMap.get(strike.strikePrice.toString());
      if (row) {
        tempOptionRows.push(row);
      } else {
        const appCommon:AppCommon = {
          formattedStrike: Number(ethers.utils.formatUnits(strike.strikePrice, 6)).toFixed(2),
          formattedExpiry: formatDate(Number(expiryDate)),
          optionType,
          quoteAsset,
          baseAsset,
          expiry: fromEthDate(Number(expiryDate)),
          // TODO: 18 should be the number of decimals
          strike: strike.strikePrice
        }
        tempOptionRows.push(<OptionRow appCommon={appCommon} option={sellBuy} last={''} ask={''} bid={''} key={strike.positionHash} optionData={emptyOptionData} />)
      }
    }
    setOptionRows(tempOptionRows);
  }, [summaryData, strikePrices])

  // On Change of user order history data
  useEffect(() => {
    const tempUserOrderRows:JSX.Element[] = [];
    if (!orderHistoryData || !orderHistoryData.user || !orderHistoryData.user.userOptions) {
      return;
    }
    let orders:any[] = [];
    for (const userOption of orderHistoryData.user.userOptions) {
      const { buyOrders, sellOrders, option } = userOption;
      const { baseAsset, quoteAsset, expiry, lastPrice, optionType, strike } = option;
      const { symbol: baseAssetSymbol } = baseAsset;
      const { symbol: quoteAssetSymbol } = quoteAsset;
      orders = orders.concat(buyOrders.map((o: any) => {
        return { ...o, optionAction: 'BUY', strike, expiry }
      }))
      orders = orders.concat(sellOrders.map((o: any) => {
        return { ...o, optionAction: 'SELL', strike, expiry }
      }))
    }
    const sortedOrders = orders.sort((a: any, b: any) => a.block - b.block);
    if (sortedOrders) {
      for (const order of sortedOrders) {
        const { expiredNonce, optionAction, fullyMatched, funded, matches, offerExpire, pricePerContract, size, timestamp, tradable, block:blockNumber, strike, expiry } = order;
        // const {optionAction, formattedSize, optionType, formattedStrike, formattedExpiry} = order;
        const orderToName = {
          optionAction,
          formattedSize: size,
          optionType,
          formattedStrike: strike,
          formattedExpiry: fromEthDate(expiry).toLocaleDateString('en-us', {month: "short", day: "numeric"})
        }
        const status =
          fullyMatched ? 'completed' :
            expiredNonce ? 'cancelled' :
              fromEthDate(offerExpire) < new Date() ? 'expired' :
                tradable ? 'active' :
                  'non-tradable';

        console.log(fromEthDate(offerExpire));
        console.log(fromEthDate(offerExpire));

        tempUserOrderRows.push(
          <Tr>
            <Td >
              <Button fontSize={"xs"} colorScheme="teal" variant="link" href={explorerLink(chainId, blockNumber, ExplorerDataType.BLOCK)}>
                {blockNumber}
              </Button>
            </Td>
            <Td h={"100"} fontWeight="semibold" lineHeight={1.8} fontSize={"xs"}>{shortOptionName(orderToName)}</Td>
            {/*<Td h={"100"} fontWeight="semibold" lineHeight={1.8} fontSize={"xs"}>{optionType + strike}</Td>*/}
            <Td maxWidth={"10px"} isNumeric={true}>
              <Text  fontSize="xs">{pricePerContract}</Text>
            </Td>
            <Td>
              <Tag size={'sm'} colorScheme={status === 'cancelled' ?
                'red' : status === 'expired' ?
                  'gray' : status === 'completed' ?
                    'cyan' : status === 'active' ?
                      'yellow': 'blue'} borderRadius={'full'}>
                <TagLabel>{status}</TagLabel>
              </Tag>
            </Td>
            <Td>
              {
                status === 'active' &&
                // <Button colorScheme="teal" size="xs" onClick={cancelOrderFunc.bind(null, order)}>
                <Button colorScheme="teal" size="xs" onClick={() => console.log('cancel does not work yet')}>
                  Cancel
                </Button>
              }
            </Td>
          </Tr>
        )

      }
    }
    setUserOrderRows(tempUserOrderRows)
  }, [orderHistoryLoading])

  useEffect(() => {
    console.log('finding user matches')
    async function main() {
      if (!account || !library) {
        return;
      }
      const fromBlock = DEPLOY_BLOCKHEIGHT;
      const latestBlockNumber = await getBlockNumber(library);
      let cursor = Number(fromBlock);
      const tempUserMatches: { buy: AppOrder[], sell: AppOrder[] } = { buy: [], sell: []};
      while (cursor < latestBlockNumber) {
        const to = Math.min(cursor + 1000, MAX_SCAN_BLOCKS);
        const buyMatches = await getMatchEvents({buyerAddress: account, provider: library, fromBlock: cursor, toBlock: to})
        const sellMatches = await getMatchEvents({sellerAddress: account, provider: library, fromBlock: cursor, toBlock: to})
        const processedBuyMatches = buyMatches.map(userEvent => matchEventToAppOrder(userEvent, 'BUY'));
        const processedSellMatches = sellMatches.map(userEvent => matchEventToAppOrder(userEvent, 'SELL'));
        tempUserMatches.buy = [ ...tempUserMatches.buy, ...processedBuyMatches ];
        tempUserMatches.sell = [ ...tempUserMatches.sell, ...processedSellMatches ];
        cursor = to + 1;
      }
      // TODO: this should cache in localStorage
      setUserMatches(tempUserMatches);
    }
    main()
      .then(() => {})
      .catch(console.error);

  }, [account, library])



  useEffect(() => {
    const subscriptionPositionHashes = [];
    if(!contractData || !expiryDate || !library) {
      return;
    }
    const strikeObjPrices = contractData['SMATIC-SUSD'][expiryDate][optionType].map((strikeNum) => {
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

  useEffect(() => {
    if (contractData) {
      const expiryDatesString = Object.keys(contractData["SMATIC-SUSD"]);
      console.log(expiryDatesString);
      console.log(contractData);
      console.log(JSON.stringify(contractData));
      setExpiryDates(expiryDatesString);
      if(!expiryDate) {
        setExpiryDate(expiryDatesString[0]);
      }
    }
  }, []);

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
    // tempUserOrderRows.push(
    //    <Tr>
    //   <Td >
    //     <Button fontSize={"xs"} colorScheme="teal" variant="link" href={explorerLink(chainId, blockNumber, ExplorerDataType.BLOCK)}>
    //       {blockNumber}
    //     </Button>
    //   </Td>
    //   <Td h={"100"} fontWeight="semibold" lineHeight={1.8} fontSize={"xs"}>{shortOptionName(order)}</Td>
    //   <Td maxWidth={"10px"} isNumeric={true}>
    //     <Text  fontSize="xs">{unitPrice}</Text>
    //   </Td>
    //   <Td>
    //     <Tag size={'sm'} colorScheme={status === 'cancelled' ? 'red' : status === 'expired'? 'gray' : status === 'completed'? 'cyan' : status === 'active'? 'yellow': 'blue'} borderRadius={'full'}>
    //       <TagLabel>{status}</TagLabel>
    //     </Tag>
    //     </Td>
    //   <Td>
    //     {
    //       status === 'active' &&
    //       <Button colorScheme="teal" size="xs" onClick={cancelOrderFunc.bind(null, order)}>
    //         Cancel
    //       </Button>
    //     }
    //   </Td>
    // </Tr>
    // )
  }
  // setUserOrderRows(tempUserOrderRows);

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
      // optionRows.push(
      //   <OptionRow appCommon={appCommon} option={sellBuy} last={''} ask={''} bid={''} key={appCommon.formattedStrike} optionData={emptyOptionData} />
      // );
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

    // optionRows.push(
    //   <OptionRow appCommon={appCommon} option={sellBuy} last={last} ask={bestAsk} bid={bestBid} key={appCommon.formattedStrike} optionData={optionData} />
    // );
  }
  return (
      <>
        <SummaryView />
        <Heading mt={10}>
          <Center>
            <Icon as={currencyIcon(chainId)} pr="1"/> {currencySymbol(chainId)} Options
          </Center>
        </Heading>

  <Container
      mt={50}
      p={5}
      shadow={useColorModeValue("2xl", "2xl")}
      flex="1"
      borderRadius="2xl"
      bg={useColorModeValue("white", "shrub.100")}
    >


      {expiryDates && expiryDates[0] ?
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
          {/*  <Tooltip p={3} label="Own the future. This date picker let's you pick important upcoming events in MATIC land as your expiry. " fontSize="xs" borderRadius="lg" bg="shrub.300" color="white">*/}
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
          :
          <Flex direction="column" mt={10}>
            <Center>
              <HelloBud boxSize={200}/>
            </Center>
            <Center pt={6}>
              <Box as="span" fontWeight="semibold" fontSize="md" color="gray.500">
                No options available yet, but you should check back again!
              </Box>
            </Center>
          </Flex>
      }
    {optionRows}
    </Container>
        {!!userOrderRows.length && <Container
        mt={50}
        p={5}
        shadow={boxShadow}
        flex="1"
        borderRadius="2xl"
        bg={backgroundColor}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Block Number</Th>
              <Th>Option</Th>
              <Th isNumeric>Price per Contract</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {userOrderRows}
          </Tbody>
        </Table>
      </Container>}
      </>
  );
}

export default OptionsView;
