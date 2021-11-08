import React, {useContext, useEffect, useReducer, useState} from 'react';
import {
    Box,
    Button,
    Center,
    Container,
    Flex, Heading,
    HStack,
    Text,
    Spacer,
    Table, Tag, TagLabel,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useRadioGroup,
    useToast,
    Link, MenuButton, Menu, MenuList, MenuItem, Divider
} from '@chakra-ui/react';
import OptionRow from "../components/OptionRow";
// import useFetch from "../hooks/useFetch";
import {
  AppCommon,
  // AppOrder,
    // AppOrderSigned,
  // ContractData,
  IndexedAppOrderSigned,
  // IndexedAppOrderSignedNumbered,
  // LastOrders,
  OrderCommon,
  PutCall,
  SellBuy
} from '../types';
import {Link as ReachLink, RouteComponentProps} from "@reach/router";
import RadioCard from '../components/Radio';
import {
    cancelOrder,
    formatDate, formatTime,
    // formatStrike,
    fromEthDate,
    // getAddress,
    // getAddressFromSignedOrder,
    getAnnouncedEvent,
    // getAnnouncedEvents,
    // getBlockNumber,
    // getLastOrders,
    // getMatchEvents,
    // getPair,
    // getUserNonce,
    hashOrderCommon,
    isBuyToOptionAction,
    // matchEventToAppOrder,
    optionTypeToNumber,
    optionTypeToString,
    // orderStatus,
    shortOptionName, subscribeToAnnouncements,
    // subscribeToAnnouncements,
    toEthDate,
    transformOrderAppChain, unsubscribeFromAnnouncements,
    // unsubscribeFromAnnouncements,
} from '../utils/ethMethods'
import {BytesLike, ethers} from "ethers";
import {
    ArrowBackIcon,
    ArrowForwardIcon, ChevronDownIcon,
    ExternalLinkIcon,
    Icon,
    QuestionOutlineIcon
} from '@chakra-ui/icons';
import {useWeb3React} from "@web3-react/core";
// import {orderBookReducer} from "../components/orderBookReducer";
import {currencyIcon, currencySymbol, ExplorerDataType, explorerLink} from "../utils/chainMethods";
// import {userOrdersReducer} from "../components/userOrdersReducer";
import {ToastDescription} from "../components/TxMonitoring";
import {TxContext} from "../components/Store";
import {handleErrorMessagesFactory} from "../utils/handleErrorMessages";
// import {nonceReducer} from "../components/nonceReducer";
import SummaryView from '../components/SummaryView'
import {HelloBud, PolygonIcon} from "../assets/Icons";
import {useQuery} from "@apollo/client";
import {ORDER_HISTORY_QUERY, SUMMARY_VIEW_QUERY} from '../constants/queries'
import contractData from "../constants/common"
import {MdHistoryToggleOff} from 'react-icons/md';
import {isMobile} from "react-device-detect";
import {FaEthereum} from "react-icons/fa";
import usePriceFeed from "../hooks/usePriceFeed";
import {CHAINLINK_MATIC, CHAINLINK_ETH} from "../constants/chainLinkPrices";

// const initialOrderBookState = {};
// const DEPLOY_BLOCKHEIGHT = process.env.REACT_APP_DEPLOY_BLOCKHEIGHT;
// const MAX_SCAN_BLOCKS = Number(process.env.REACT_APP_MAX_SCAN_BLOCKS);

function OptionsView(props: RouteComponentProps) {
    const {library, chainId, account} = useWeb3React();
    const { price: maticPrice } = usePriceFeed(CHAINLINK_MATIC);
    const { price: ethPrice } = usePriceFeed(CHAINLINK_ETH);
    const sellBuys = ['BUY', 'SELL']
    const optionTypes = ['PUT', 'CALL']
    const [sellBuy, setSellBuy] = useState<SellBuy>('BUY');
    const [optionType, setOptionType] = useState<PutCall>('CALL');
    const [expiryDate, setExpiryDate] = useState<string>();
    const [strikePrices, setStrikePrices] = useState<{ strikePrice: ethers.BigNumber, positionHash: string }[]>([]);
    const [expiryDates, setExpiryDates] = useState<string[]>([]);
    // const [lastMatches, setLastMatches] = useState<LastOrders>({})
  // const [orderBookState, orderBookDispatch] = useReducer(orderBookReducer, initialOrderBookState)
  // const [userOrders, userOrderDispatch] = useReducer(userOrdersReducer, {})
  // const [nonces, noncesDispatch] = useReducer(nonceReducer, {})
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [localError, setLocalError] = useState('');
  // const [userMatches, setUserMatches] = useState<{buy: any[], sell: any[]}>({ buy: [], sell: []})
  const toast = useToast();
  const boxShadow = useColorModeValue("2xl", "2xl");
  const backgroundColor = useColorModeValue("white", "shrub.100");
  const [localOrderHistoryRows, setLocalOrderHistoryRows] = useState<JSX.Element[]>([]);
  const [optionRows, setOptionRows] = useState<JSX.Element[]>([]);
  const [userOrderRows, setUserOrderRows] = useState<JSX.Element[]>([]);

  const livePriceColor = useColorModeValue("green.500", "green.200");
  const selectorColor = useColorModeValue("gray.400", "gray.800");
  const selectorBg = useColorModeValue("white", "shrub.100");

  // TODO un-hardcode this
  const quoteAsset = process.env.REACT_APP_SMATIC_TOKEN_ADDRESS;
  const baseAsset = process.env.REACT_APP_SUSD_TOKEN_ADDRESS;

    const {loading: summaryLoading, error: summaryError, data: summaryData} = useQuery(SUMMARY_VIEW_QUERY, {
        variables: {
            expiry: Number(expiryDate),
            optionType,
            baseAsset: baseAsset && baseAsset.toLowerCase(),
            quoteAsset: quoteAsset && quoteAsset.toLowerCase(),
            offerExpire: Math.floor(toEthDate(new Date()) / 10) * 10
        },
        pollInterval: 10000
    });
    const {
        loading: orderHistoryLoading,
        error: orderHistoryError,
        data: orderHistoryData
    } = useQuery(ORDER_HISTORY_QUERY, {
        variables: {
            id: account && account.toLowerCase()
        }
    });

    const bg = useColorModeValue("green", "teal");

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
        defaultValue: getDefaultExpiryDate(),
        onChange: (nextValue) => setExpiryDate(nextValue),
    });

    const groupOption = getOptionRootProps();
    const groupOptionType = getOptionTypeRootProps();
    const groupExpiry = getExpiryRootProps();

    useEffect(() => {
    console.log(JSON.stringify(pendingTxsState));
    console.log(pendingTxsState)
    const tempOrderHistoryRows = []
    for (const [txid, txState] of Object.entries(pendingTxsState).reverse()) {
      const { data } = txState;
      if (!data) {
        continue;
      }
      if (['limitOrder','marketOrder'].includes(txState.data.txType)) {
        const {id, blockNumber, orderToName, positionHash, userAccount, status, pricePerContract} = data;
                tempOrderHistoryRows.push(returnOrderHistoryRow(id, blockNumber, orderToName, positionHash, userAccount, status, pricePerContract))
            }
    }
    setLocalOrderHistoryRows(tempOrderHistoryRows);
  }, [pendingTxsState])


  // Updates OptionRows On summary graphy query complete or strikePrices being set
    useEffect(() => {
        if(summaryLoading) {
            return;
        }
        const tempOptionRows: JSX.Element[] = [];
        const tempOptionMap: Map<string, JSX.Element> = new Map();
        const emptyOptionData = {
            buyOrdersIndexed: {},
            sellOrdersIndexed: {},
            buyOrders: [],
            sellOrders: [],
            last: ''
        }
        if (summaryData && summaryData.options) {
            for (const option of summaryData.options) {
                const {strike: decimalStrike, lastPrice, sellOrders, buyOrders, id} = option;
                const ask = (sellOrders[0] && sellOrders[0].pricePerContract) || '';
                const bid = (buyOrders[0] && buyOrders[0].pricePerContract) || '';
                const appCommon: AppCommon = {
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
                    <OptionRow appCommon={appCommon} option={sellBuy} last={lastPrice} ask={ask} bid={bid} key={id}
                               optionData={optionData}/>
                );
            }
        }
        for (const strike of strikePrices) {
            const row = tempOptionMap.get(strike.strikePrice.toString());
            if (row) {
                tempOptionRows.push(row);
            } else {
                const appCommon: AppCommon = {
                    formattedStrike: Number(ethers.utils.formatUnits(strike.strikePrice, 6)).toFixed(2),
                    formattedExpiry: formatDate(Number(expiryDate)),
                    optionType,
                    quoteAsset,
                    baseAsset,
                    expiry: fromEthDate(Number(expiryDate)),
                    // TODO: 18 should be the number of decimals
                    strike: strike.strikePrice
                }
                tempOptionRows.push(<OptionRow appCommon={appCommon} option={sellBuy} last={''} ask={''} bid={''}
                                               key={strike.positionHash} optionData={emptyOptionData}/>)
            }
        }
        setOptionRows(tempOptionRows);
    }, [summaryLoading, strikePrices])

    // Set order history on change of user order history data
    useEffect(() => {
        const tempUserOrderRows: JSX.Element[] = [];
        if (!orderHistoryData || !orderHistoryData.user || !orderHistoryData.user.userOptions) {
            return;
        }
        let orders: any[] = [];
        const {id: userAccount} = orderHistoryData.user;
        for (const userOption of orderHistoryData.user.userOptions) {
            const {buyOrders, sellOrders, option} = userOption;
            const {baseAsset, quoteAsset, expiry, lastPrice, optionType, strike, id: positionHash} = option;
            const {symbol: baseAssetSymbol} = baseAsset;
            const {symbol: quoteAssetSymbol} = quoteAsset;
            orders = orders.concat(buyOrders.map((o: any) => {
                return {...o, optionAction: 'BUY', strike, expiry, positionHash, optionType}
            }))
            orders = orders.concat(sellOrders.map((o: any) => {
                return {...o, optionAction: 'SELL', strike, expiry, positionHash, optionType}
            }))
        }
        const sortedOrders = orders.sort((a: any, b: any) => b.block - a.block);
        if (sortedOrders) {
            for (const order of sortedOrders) {
                const {
                    expiredNonce,
                    optionAction,
                    fullyMatched,
                    funded,
                    matches,
                    offerExpire,
                    pricePerContract,
                    size,
                    timestamp,
                    tradable,
                    block: blockNumber,
                    strike,
                    optionType,
                    expiry,
                    id,
                    positionHash
                } = order;
                const orderToName = {
                    optionAction,
                    formattedSize: size,
                    optionType: optionType,
                    formattedStrike: strike,
                    formattedExpiry: fromEthDate(expiry).toLocaleDateString('en-us', {month: "short", day: "numeric"})
                }
                const status =
                    fullyMatched ? 'completed' :
                        expiredNonce ? 'cancelled' :
                            fromEthDate(offerExpire) < new Date() ? 'expired' :
                                tradable ? 'active' :
                                    'non-tradable';

                const formattedPricePerContract = (Math.round(Number(pricePerContract) * 10000) / 10000).toString();

                tempUserOrderRows.push(returnOrderHistoryRow(id, blockNumber, orderToName, positionHash, userAccount, status, formattedPricePerContract))}
    }
    setUserOrderRows(tempUserOrderRows)
  }, [orderHistoryLoading])

  function returnOrderHistoryRow(id: string, blockNumber: number, orderToName: any, positionHash: string, userAccount: string, status: string, pricePerContract: string) {
    return <Tr key={id}>
        <Td mW={"1000"}>
          <Link color="teal.400" fontSize={"xs"}
                                  href={explorerLink(chainId, blockNumber, ExplorerDataType.BLOCK)} isExternal>
            {blockNumber}<ExternalLinkIcon mx="2px" mb="3px"/>
          </Link>
        </Td>
        <Td fontWeight="semibold" fontSize={"xs"} lineHeight={1.8}>
                            <Text letterSpacing="wider" color="gray.600">{shortOptionName(orderToName)}</Text>
                        </Td>
        <Td maxWidth={"10px"} isNumeric={true}>
          <Text fontWeight="semibold" fontSize="xs" letterSpacing={"wide"} color="gray.600">{pricePerContract}</Text>
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
            <Button colorScheme={bg} size="xs" onClick={() => cancelOrderFunc(positionHash, userAccount, blockNumber)}>
              Cancel
            </Button>
          }
        </Td>
      </Tr>
  }

  // Find matches for user
  // useEffect(() => {
  //   async function main() {
  //     if (!account || !library) {
  //       return;
  //     }
  //     const fromBlock = DEPLOY_BLOCKHEIGHT;
  //     const latestBlockNumber = await getBlockNumber(library);
  //     let cursor = Number(fromBlock);
  //     const tempUserMatches: { buy: AppOrder[], sell: AppOrder[] } = { buy: [], sell: []};
  //     while (cursor < latestBlockNumber) {
  //       const to = Math.min(cursor + 1000, MAX_SCAN_BLOCKS);
  //       const buyMatches = await getMatchEvents({buyerAddress: account, provider: library, fromBlock: cursor, toBlock: to})
  //       const sellMatches = await getMatchEvents({sellerAddress: account, provider: library, fromBlock: cursor, toBlock: to})
  //       const processedBuyMatches = buyMatches.map(userEvent => matchEventToAppOrder(userEvent, 'BUY'));
  //       const processedSellMatches = sellMatches.map(userEvent => matchEventToAppOrder(userEvent, 'SELL'));
  //       tempUserMatches.buy = [ ...tempUserMatches.buy, ...processedBuyMatches ];
  //       tempUserMatches.sell = [ ...tempUserMatches.sell, ...processedSellMatches ];
  //       cursor = to + 1;
  //     }
    //     // TODO: this should cache in localStorage
  //     setUserMatches(tempUserMatches);
  //   }
  //   main()
  //     .then(() => {})
  //     .catch(console.error);
  //
  // }, [account, library])

    // Set the strike prices
  useEffect(() => {
    const subscriptionPositionHashes = [];
    if(!contractData || !expiryDate) {
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
    setStrikePrices(strikeObjPrices);
    // Get the orders for each of the contracts via rpc
    // if (!library) {
    //   return;
    // }
    // getOrderData(strikeObjPrices.map(s => s.positionHash))
    //   .catch(e => console.error(`Something went wrong with the orderbook: ${e}`));
    //
        // function processEvent(event: any) {
    //   const appOrderSigned = processEventIntoAppOrderSigned(event)
    //   orderBookDispatch({type: 'add', orders: [appOrderSigned]})
    // }
    //
        // async function getOrderData(positionHashes: BytesLike[]) {
    //   for (const positionHash of positionHashes) {
    //     subscribeToAnnouncements(library, positionHash, null, processEvent);
    //     subscriptionPositionHashes.push(positionHash)
    //     const eventsForHash = await getAnnouncedEvents({provider: library, positionHash})
    //     const formattedEventsForHash: IndexedAppOrderSigned[] = [];
    //     for (const event of eventsForHash) {
    //       const { args, transactionHash } = event;
    //       const { common, order, sig } = args;
    //       const { baseAsset, quoteAsset, strike } = common;
    //       const { size, fee } = order;
    //       const { r, s, v } = sig;
    //
              //       const expiry = fromEthDate(common.expiry.toNumber());
    //       const optionType = optionTypeToString(common.optionType);
    //       const formattedExpiry = expiry.toLocaleDateString('en-us', {month: "short", day: "numeric"});
    //       const formattedStrike = ethers.utils.formatUnits(strike, 6);  // Need to divide by 1M to get the actual strike
    //       const nonce = order.nonce.toNumber();
    //       const formattedSize = ethers.utils.formatUnits(size, 18);
    //       const optionAction = isBuyToOptionAction(order.isBuy);
    //       const totalPrice = ethers.BigNumber.from(order.price);
    //       const unitPrice = Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
    //       const offerExpire = fromEthDate(order.offerExpire.toNumber());
    //       const formattedFee = ethers.utils.formatUnits(fee, 18);
    //       const appOrderSigned: IndexedAppOrderSigned = {
    //         baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, r, s, v, transactionHash
    //       }
    //       const iOrder = transformOrderAppChain(appOrderSigned)
    //       const address = await getAddressFromSignedOrder(iOrder, library);
    //       appOrderSigned.address = address;
    //       formattedEventsForHash.push(appOrderSigned);
    //     }
    //     orderBookDispatch({type: 'add', orders: formattedEventsForHash})
    //   }
    // }
    //
    // return function cleanup() {
    //   if (!library) {
    //     return;
    //   }
    //   unsubscribeFromAnnouncements(library);
    // }
    //
  },[expiryDate, optionType]);

      // get orders from user over rpc - deprecated for subgraph
  // useEffect(() => {
  //   if (!library) {
  //     return;
  //   }
  //   async function main() {
  //     const user = await getAddress(library);
  //     const userEvents = await getAnnouncedEvents({provider: library, user })
  //     const tempNonces: {[pair: string]: number} = {};
  //     for (const userEvent of userEvents) {
  //       const { args, transactionHash, blockNumber } = userEvent;
  //       const { common, order, user: address, sig } = args;
  //       const { baseAsset, quoteAsset, strike } = common;
  //       const { size, fee } = order;
  //       const { r, s, v } = sig;
  //       const pair = getPair(baseAsset, quoteAsset);
  //       const appCommon: OrderCommon = {
  //         ...common,
  //         expiry: common.expiry.toNumber(),
  //         optionType: common.optionType ? 1 : 0
  //       }
        //       if (!tempNonces[pair]) {
  //         const userPairNonce = await getUserNonce(user, appCommon, library);
  //         tempNonces[pair] = userPairNonce;
  //         noncesDispatch({type: 'update', user, pair, nonce: userPairNonce});
  //       }
  //       const expiry = fromEthDate(common.expiry.toNumber());
  //       const optionType = optionTypeToString(common.optionType);
  //       const formattedExpiry = expiry.toLocaleDateString('en-us', {month: "short", day: "numeric"});
  //       const formattedStrike = ethers.utils.formatUnits(strike, 6);  // Need to divide by 1M to get the actual strike
  //       const nonce = order.nonce.toNumber();
  //       const formattedSize = ethers.utils.formatUnits(size, 18);
  //       const optionAction = isBuyToOptionAction(order.isBuy);
  //       const totalPrice = ethers.BigNumber.from(order.price);
  //       const unitPrice = Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
  //       const offerExpire = fromEthDate(order.offerExpire.toNumber());
  //       const formattedFee = ethers.utils.formatUnits(fee, 18);
  //       const appOrderSignedNumbered: IndexedAppOrderSignedNumbered = {
  //         baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, r, s, v, transactionHash, address, blockNumber
  //       }
  //       userOrderDispatch({type: 'add', order: appOrderSignedNumbered})
  //     }
  //   }
  //
  //   main()
  //     .then(() => {})
  //     .catch(console.error)
  // }, [library])

    // Set the expiry dates on load
  useEffect(() => {
    if (contractData) {
        const now = new Date();
        const expiryDatesString = Object.keys(contractData["SMATIC-SUSD"])
            .filter(d => fromEthDate(Number(d)) > now);
      setExpiryDates(expiryDatesString);
      if(!expiryDate) {
        setExpiryDate(expiryDatesString[0]);
      }
    }
  }, []);

    // Setting the status in some old code
  // for (const [transactionHash, order] of Object.entries(userOrders)) {
  //   const { unitPrice, blockNumber, quoteAsset, baseAsset} = order;
  //   const pair = getPair(baseAsset, quoteAsset);
  //   let status;
  //   if (account) {
  //     const nonce = nonces[account] && nonces[account][pair]
  //     status = orderStatus(order, nonce, userMatches);
  //   } else {
  //     status = ''
  //   }
  // }

    function cancelOrderFunc(positionHash: BytesLike, user: string, blockHeight: number) {
        async function main() {
            const orders = await getAnnouncedEvent(library, positionHash, user, blockHeight);
            if (!orders || !orders[0]) {
                throw new Error('Order could not be found');
            }
            const order = orders[0];
            const iOrder = transformOrderAppChain(order);
            const tx = await cancelOrder(iOrder, library);
            const description = `Cancel order for ${shortOptionName(order)}`;
            pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
            try {
                const receipt = await tx.wait()
                const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
                toast({
                    title: 'Transaction Confirmed',
                    description: toastDescription,
                    status: 'success',
                    isClosable: true,
                    variant: 'solid',
                    position: 'top-right'
                })
                pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
            } catch (e) {
                const toastDescription = ToastDescription(description, e.transactionHash, chainId);
                toast({
                    title: 'Transaction Failed',
                    description: toastDescription,
                    status: 'error',
                    isClosable: true,
                    variant: 'solid',
                    position: 'top-right'
                })
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

    function getDefaultExpiryDate() {
        const now = new Date();
        const expiryDatesString = Object.keys(contractData["SMATIC-SUSD"]);
        const filteredSortedExpiryDates = expiryDatesString
            .map(ethDate => fromEthDate(Number(ethDate)))
            .filter(date => date > now)
            .sort((a, b) => Number(a) - Number(b));
        return filteredSortedExpiryDates[0] ? toEthDate(filteredSortedExpiryDates[0]).toString() : '';
    }

    function processEventIntoAppOrderSigned(event: any) {
        const {common, positionHash, order, sig, eventInfo, user} = event;
        const {baseAsset, quoteAsset, strike} = common;
        const {size, fee} = order;
        const {r, s, v} = sig;
        const {transactionHash} = eventInfo;

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
            baseAsset,
            quoteAsset,
            expiry,
            strike,
            optionType,
            formattedExpiry,
            formattedStrike,
            formattedSize,
            optionAction,
            nonce,
            unitPrice,
            offerExpire,
            fee,
            size,
            totalPrice,
            formattedFee,
            r,
            s,
            v,
            transactionHash
        }
        const address = user;
        appOrderSigned.address = address;
        return appOrderSigned;
    }

    // for (const {strikePrice} of strikePrices) {
  //   const niceExpiry = formatDate(fromEthDate(Number(expiryDate)));
  //   const appCommon:AppCommon = {
  //     formattedStrike: formatStrike(strikePrice),
  //     formattedExpiry: formatDate(Number(expiryDate)),
  //     optionType,
  //     quoteAsset,
  //     baseAsset,
  //     expiry: fromEthDate(Number(expiryDate)),
  //     strike: strikePrice
  //   }
  //
      //   if (
  //     !expiryDate ||
  //     !orderBookState ||
  //     !orderBookState[quoteAsset] ||
  //     !orderBookState[quoteAsset][baseAsset] ||
  //     !orderBookState[quoteAsset][baseAsset][niceExpiry] ||
  //     !orderBookState[quoteAsset][baseAsset][niceExpiry][optionType] ||
  //     !orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()]
  //   ) {
  //     const emptyOptionData = {
  //       buyOrdersIndexed: {},
  //       sellOrdersIndexed: {},
  //       buyOrders: [],
  //       sellOrders: [],
  //       last: ''
  //     }
  //
        //     continue;
  //   }
  //
      //   const optionData = orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()];
  //   const bestBid = orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()].bid?.toFixed(2) || '';
  //   const bestAsk = orderBookState[quoteAsset][baseAsset][niceExpiry][optionType][strikePrice.toString()].ask?.toFixed(2) || '';
  //
  //
      //   const orderCommon: OrderCommon = {
  //     baseAsset,
  //     quoteAsset,
  //     expiry: Number(expiryDate),
  //     strike: strikePrice,
  //     optionType: optionTypeToNumber(optionType)
  //   }
  //   const positionHash = hashOrderCommon(orderCommon)
  //   const last = lastMatches[positionHash] ? String(lastMatches[positionHash]) : ' -';
  //
    // }
  return (
      <>
        <SummaryView />
          <Center>
              <Menu isLazy>
                  <MenuButton><Heading mt={10}><Icon as={currencyIcon(chainId)} pr="2"/> sMATIC Options <ChevronDownIcon /></Heading></MenuButton>
              <MenuList>
                      {/* MenuItems are not rendered unless Menu is open */}
                  <MenuItem minW="400px" fontSize={"lg"}><FaEthereum/> <Text ml={"1"}>sETH Options (coming soon)</Text></MenuItem>
                  </MenuList>
              </Menu>
                </Center>
          <Container
              mt={30}
              flex="1"
              borderRadius="2xl"
          >
              {!isMobile && <Flex>
                  <Box>
                      <Button leftIcon={<ArrowBackIcon />} colorScheme="blue" variant="link" fontSize={"xs"}
                              as={ReachLink} to={'/shrubfolio'}>
                          Shrubfolio
                      </Button>
                  </Box>
                  <Spacer/>
                  <Box>
                      <Text color={livePriceColor} fontSize={"xs"} fontWeight={"bold"}>
                        sMATIC: ${maticPrice ? maticPrice.toFixed(2) : "-"}
                      </Text>
                  </Box>
              </Flex> }
          </Container>

            <Container
                mt={1}
                p={5}
                flex="1"
                borderRadius="2xl"
                bg={selectorBg}
                mb={8}
            >

                {expiryDates && expiryDates[0] ?
                    <>
                        <Box>
                            {!isMobile && <Text fontSize={"xs"} fontWeight={"extrabold"} mb={3} color={"gray.400"} display={{ sm: "none", md: "block" }}>Expiry Date</Text>}
                            <HStack {...groupExpiry} spacing={{ base: 2, md: 5 }}>
                                {expiryDates.map((expiry) => {
                                    const radio = getExpiryRadioProps({value: expiry});
                                    return (
                                        (Number(expiry) * 1000) > Date.now() &&
                                        <RadioCard key={expiry} {...radio}>
                                            <Text> {formatDate(Number(expiry))}</Text>
                                            {!isMobile && <Text fontSize="xs" display={{ sm: "none", md: "block" }}>{formatTime(Number(expiry))}</Text>}
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

              <Flex
                  mt={"6"}
              >
                  <Box>
                      {!isMobile &&   <Text fontSize={"xs"} fontWeight={"extrabold"} mb={3} color={"gray.400"} display={{ sm: "none", md: "block" }}>Option</Text>}
                  <HStack {...groupOption} spacing={{ base: 2, md: 3 }}>

                      {sellBuys.map((value) => {
                          const radio = getOptionRadioProps({value});
                          return (
                              <RadioCard key={value} {...radio}>
                                  {value}
                              </RadioCard>
                          );
                      })}
                  </HStack>
                  </Box>

                  <Spacer/>
                  <Spacer/>
                  <Box>
                      {!isMobile &&  <Text fontSize={"xs"} fontWeight={"extrabold"} mb={3} color={"gray.400"} display={{ sm: "none", md: "block" }}>Option Type</Text>}
                  <HStack {...groupOptionType} spacing={{ base: 2, md: 3 }}>
                      {optionTypes.map((value) => {
                          const radio = getOptionTypeRadioProps({value});
                          return (
                              <RadioCard key={value} {...radio}>
                                  {value}
                              </RadioCard>
                          );
                      })}
                  </HStack>
                  </Box>
              </Flex>
          </Container>
          {optionRows}
            {
                <>
                    <Heading mt={14}>
                        <Center>
                            <Icon as={MdHistoryToggleOff} pr="2"/> Order History
                        </Center>
                    </Heading>
                    <Container
                        mt={30}
                        p={5}
                        shadow={boxShadow}
                        flex="1"
                        borderRadius="2xl"
                        bg={backgroundColor}
                    >
                        {userOrderRows.length + localOrderHistoryRows.length ? <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Block Number</Th>
                                        <Th>Order</Th>
                                        <Th isNumeric>Price per Contract</Th>
                                        <Th>Status</Th>
                                        <Th/>
                                    </Tr>
                                </Thead>
                                <Tbody>
                    {localOrderHistoryRows}
                                    {userOrderRows}
                                </Tbody>
                            </Table> :
                            <Flex direction="column" mt={10}>
                                <Center>
                                    <HelloBud boxSize={200}/>
                                </Center>
                                <Center pt={6}>
                                    <Box as="span" fontWeight="semibold" fontSize="md" color="gray.500">
                                        No orders from you yet, but your order history will show up here!
                                    </Box>
                                </Center>
                            </Flex>}
                    </Container>
                </>
            }
        </>
    );
}

export default OptionsView;
