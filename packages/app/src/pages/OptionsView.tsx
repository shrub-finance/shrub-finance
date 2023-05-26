import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  Spacer,
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useRadioGroup,
  useToast,
  Link,
  MenuButton,
  Menu,
  MenuList,
  MenuItem,
  Spinner,
  TabPanel,
  TabPanels,
  Tab,
  TabList,
  Tabs,
} from "@chakra-ui/react";
import OptionRow from "../components/OptionRow";
import {
  AppCommon,
  IndexedAppOrderSigned,
  OrderCommon,
  PutCall,
  SellBuy,
} from "../types";
import {
  Link as ReachLink,
  navigate,
  RouteComponentProps,
} from "@reach/router";
import RadioCard from "../components/Radio";
import {
  cancelOrder,
  floorGroupNumber,
  formatDate,
  formatTime,
  fromEthDate,
  getAnnouncedEvent,
  hashOrderCommon,
  isBuyToOptionAction,
  optionTypeToNumber,
  optionTypeToString,
  shortOptionName,
  toEthDate,
  transformOrderAppChain,
} from "../utils/ethMethods";
import { BytesLike, ethers } from "ethers";
import { ChevronDownIcon, ExternalLinkIcon, Icon } from "@chakra-ui/icons";
import { useWeb3React } from "@web3-react/core";
import { ExplorerDataType, explorerLink } from "../utils/chainMethods";
import { ToastDescription } from "../components/TxMonitoring";
import { TxContext } from "../components/Store";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import SummaryView from "../components/SummaryView";
import { HelloBud } from "../assets/Icons";
import { useLazyQuery } from "@apollo/client";
import {
  ORDER_HISTORY_QUERY,
  SUMMARY_VIEW_ALL_QUERY,
} from "../constants/queries";
import contractData from "../constants/common";
import { MdHistoryToggleOff } from "react-icons/md";
import { isMobile } from "react-device-detect";
import { FaEthereum } from "react-icons/fa";
import usePriceFeed from "../hooks/usePriceFeed";
import { CHAINLINK_MATIC, CHAINLINK_ETH } from "../constants/chainLinkPrices";

function OptionsView(props: RouteComponentProps) {
  const { library, chainId, account } = useWeb3React();
  const { price: maticPrice } = usePriceFeed(CHAINLINK_MATIC);
  const { price: ethPrice } = usePriceFeed(CHAINLINK_ETH);
  const sellBuys = ["BUY", "SELL"];
  const optionTypes = ["PUT", "CALL"];
  const [sellBuy, setSellBuy] = useState<SellBuy>("BUY");
  const [optionType, setOptionType] = useState<PutCall>("CALL");
  const [expiryDate, setExpiryDate] = useState<string>();
  const [strikePrices, setStrikePrices] = useState<
    { strikePrice: ethers.BigNumber; positionHash: string }[]
  >([]);
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [localError, setLocalError] = useState("");
  const toast = useToast();
  const boxShadow = useColorModeValue("2xl", "2xl");
  const backgroundColor = useColorModeValue("white", "dark.100");
  const [localOrderHistoryRows, setLocalOrderHistoryRows] = useState<
    JSX.Element[]
  >([]);
  const [optionRows, setOptionRows] = useState<JSX.Element[]>([]);
  const [userOrderRows, setUserOrderRows] = useState<JSX.Element[]>([]);

  const livePriceColor = useColorModeValue("green.500", "green.200");
  const selectorBg = useColorModeValue("white", "dark.100");
  const orderHistoryColor = useColorModeValue("gray.700", "gray.300");

  // TODO un-hardcode this
  const quoteAsset = process.env.REACT_APP_SMATIC_TOKEN_ADDRESS;
  const baseAsset = process.env.REACT_APP_SUSD_TOKEN_ADDRESS;

  const goBack = () => {
    navigate(-1);
  };

  const [
    getSummaryAllQuery,
    {
      loading: summaryAllLoading,
      error: summaryAllError,
      data: summaryAllData,
    },
  ] = useLazyQuery(SUMMARY_VIEW_ALL_QUERY, {
    variables: {
      expiries: expiryDates.map((d) => Number(d)),
      optionTypes: ["CALL", "PUT"],
      baseAsset: baseAsset && baseAsset.toLowerCase(),
      quoteAsset: quoteAsset && quoteAsset.toLowerCase(),
      offerExpire: floorGroupNumber(toEthDate(new Date()), 15),
    },
    pollInterval: 15000, // Poll every minute
  });

  const [
    getOrderHistoryQuery,
    {
      loading: orderHistoryLoading,
      error: orderHistoryError,
      data: orderHistoryData,
    },
  ] = useLazyQuery(ORDER_HISTORY_QUERY, {
    variables: {
      id: account && account.toLowerCase(),
    },
  });

  const tabColor = useColorModeValue("gray", "white");

  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

  if (!quoteAsset || !baseAsset) {
    throw new Error("missing quoteAsset or baseAsset");
  }

  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: sellBuy,
    onChange: (nextValue: SellBuy) => setSellBuy(nextValue),
  });

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
    // console.log('useEffect - 1 - set localOrderHistoryRows');
    // console.log(JSON.stringify(pendingTxsState));
    // console.log(pendingTxsState)
    const tempOrderHistoryRows = [];
    if (!orderHistoryData) {
      return;
    }
    const queryBlock =
      orderHistoryData &&
      orderHistoryData._meta &&
      orderHistoryData._meta.block &&
      orderHistoryData._meta.block.number;
    for (const [txid, txState] of Object.entries(pendingTxsState).reverse()) {
      const { data } = txState;
      if (!data) {
        continue;
      }
      if (["limitOrder", "marketOrder"].includes(txState.data.txType)) {
        const {
          id,
          blockNumber,
          orderToName,
          positionHash,
          userAccount,
          status,
          pricePerContract,
        } = data;
        if (blockNumber && blockNumber <= queryBlock) {
          // Don't add this to localOrderHistoryRows if it is already in the order history query from subgraph
          continue;
        }
        tempOrderHistoryRows.push(
          returnOrderHistoryRow(
            id,
            blockNumber,
            orderToName,
            positionHash,
            userAccount,
            status,
            pricePerContract
          )
        );
      }
    }
    setLocalOrderHistoryRows(tempOrderHistoryRows);
  }, [pendingTxsState, orderHistoryData]);

  // Updates OptionRows On summary graph query complete or strikePrices being set
  useEffect(() => {
    // console.log('useEffect - 2 - update optionRows');
    if (summaryAllLoading) {
      return;
    }
    const tempOptionRows: JSX.Element[] = [];
    const tempOptionMap: Map<string, JSX.Element> = new Map();
    const emptyOptionData = {
      buyOrdersIndexed: {},
      sellOrdersIndexed: {},
      buyOrders: [],
      sellOrders: [],
      last: "",
    };
    if (summaryAllData && summaryAllData.options) {
      const matchingOptions = summaryAllData.options.filter((o: any) => {
        return (
          o.expiry.toString() === expiryDate && o.optionType === optionType
        );
      });
      for (const option of matchingOptions) {
        const {
          strike: decimalStrike,
          lastPrice,
          sellOrders,
          buyOrders,
          id,
        } = option;
        const ask = (sellOrders[0] && sellOrders[0].pricePerContract) || "";
        const bid = (buyOrders[0] && buyOrders[0].pricePerContract) || "";
        const appCommon: AppCommon = {
          formattedStrike: Number(decimalStrike).toFixed(2),
          formattedExpiry: formatDate(Number(expiryDate)),
          optionType,
          quoteAsset,
          baseAsset,
          expiry: fromEthDate(Number(expiryDate)),
          // TODO: 18 should be the number of decimals
          strike: ethers.utils.parseUnits(decimalStrike, 6),
        };
        const optionData = {
          buyOrdersIndexed: {},
          sellOrdersIndexed: {},
          buyOrders: buyOrders.map((order: any) => {
            return {
              unitPrice: Number(order.pricePerContract),
              formattedSize: order.size,
              positionHash: order.option.id,
              user: order.userOption.user.id,
              blockHeight: order.block,
            };
          }),
          sellOrders: sellOrders.map((order: any) => {
            return {
              unitPrice: Number(order.pricePerContract),
              formattedSize: order.size,
              positionHash: order.option.id,
              user: order.userOption.user.id,
              blockHeight: order.block,
            };
          }),
          last: "",
        };
        tempOptionMap.set(
          ethers.utils.parseUnits(decimalStrike, 6).toString(),
          <OptionRow
            appCommon={appCommon}
            option={sellBuy}
            last={lastPrice}
            ask={ask}
            bid={bid}
            key={id}
            positionHash={id}
            optionData={optionData}
          />
        );
      }
    }
    for (const strike of strikePrices) {
      const row = tempOptionMap.get(strike.strikePrice.toString());
      if (row) {
        tempOptionRows.push(row);
      } else {
        const appCommon: AppCommon = {
          formattedStrike: Number(
            ethers.utils.formatUnits(strike.strikePrice, 6)
          ).toFixed(2),
          formattedExpiry: formatDate(Number(expiryDate)),
          optionType,
          quoteAsset,
          baseAsset,
          expiry: fromEthDate(Number(expiryDate)),
          // TODO: 18 should be the number of decimals
          strike: strike.strikePrice,
        };
        tempOptionRows.push(
          <OptionRow
            appCommon={appCommon}
            option={sellBuy}
            last={""}
            ask={""}
            bid={""}
            key={strike.positionHash}
            positionHash={strike.positionHash}
            optionData={emptyOptionData}
          />
        );
      }
    }
    setOptionRows(tempOptionRows);
  }, [summaryAllData, strikePrices, sellBuy]);

  // Set order history on change of user order history data
  useEffect(() => {
    // console.log('useEffect - 3 - set userOrderRows (order history)')
    const tempUserOrderRows: JSX.Element[] = [];
    if (
      !orderHistoryData ||
      !orderHistoryData.user ||
      !orderHistoryData.user.userOptions
    ) {
      return;
    }
    let orders: any[] = [];
    const { id: userAccount } = orderHistoryData.user;
    for (const userOption of orderHistoryData.user.userOptions) {
      const { buyOrders, sellOrders, option } = userOption;
      const {
        baseAsset,
        quoteAsset,
        expiry,
        lastPrice,
        optionType,
        strike,
        id: positionHash,
      } = option;
      const { symbol: baseAssetSymbol } = baseAsset;
      const { symbol: quoteAssetSymbol } = quoteAsset;
      orders = orders.concat(
        buyOrders.map((o: any) => {
          return {
            ...o,
            optionAction: "BUY",
            strike,
            expiry,
            positionHash,
            optionType,
          };
        })
      );
      orders = orders.concat(
        sellOrders.map((o: any) => {
          return {
            ...o,
            optionAction: "SELL",
            strike,
            expiry,
            positionHash,
            optionType,
          };
        })
      );
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
          positionHash,
        } = order;
        const orderToName = {
          optionAction,
          formattedSize: size,
          optionType: optionType,
          formattedStrike: strike,
          formattedExpiry: fromEthDate(expiry).toLocaleDateString("en-us", {
            month: "short",
            day: "numeric",
          }),
        };
        const status = fullyMatched
          ? "complete"
          : expiredNonce
          ? "cancelled"
          : fromEthDate(offerExpire) < new Date()
          ? "expired"
          : tradable
          ? "active"
          : "non-tradable";

        const formattedPricePerContract = (
          Math.round(Number(pricePerContract) * 10000) / 10000
        ).toString();

        tempUserOrderRows.push(
          returnOrderHistoryRow(
            id,
            blockNumber,
            orderToName,
            positionHash,
            userAccount,
            status,
            formattedPricePerContract
          )
        );
      }
    }
    setUserOrderRows(tempUserOrderRows);
  }, [orderHistoryLoading]);

  // Set the strike prices
  useEffect(() => {
    // console.log('useEffect - 4 - set strike prices');
    if (!contractData || !expiryDate) {
      return;
    }
    const strikeObjPrices = contractData["SMATIC-SUSD"][expiryDate][
      optionType
    ].map((strikeNum) => {
      const strike = ethers.BigNumber.from(strikeNum);
      const common: OrderCommon = {
        baseAsset,
        quoteAsset,
        expiry: Number(expiryDate),
        strike,
        optionType: optionTypeToNumber(optionType),
      };
      const positionHash = hashOrderCommon(common);
      return { strikePrice: strike, positionHash };
    });
    setStrikePrices(strikeObjPrices);
  }, [expiryDate, optionType]);

  // Set the expiry dates on load
  useEffect(() => {
    // console.log('useEffect - 5 - set expiry dates and make summaryAll query');
    if (contractData) {
      const now = new Date();
      const expiryDatesString = Object.keys(contractData["SMATIC-SUSD"]).filter(
        (d) => fromEthDate(Number(d)) > now
      );
      setExpiryDates(expiryDatesString);
      if (!expiryDate) {
        setExpiryDate(expiryDatesString[0]);
      }
      // Make initial query
      const expiries = expiryDatesString.map((d) => Number(d));
      getSummaryAllQuery({
        variables: {
          expiries,
          optionTypes: ["CALL", "PUT"],
          baseAsset: baseAsset && baseAsset.toLowerCase(),
          quoteAsset: quoteAsset && quoteAsset.toLowerCase(),
          offerExpire: toEthDate(new Date()),
        },
      });
    }
  }, []);

  // Get order history after account is available
  useEffect(() => {
    // console.log('useEffect - 6 - get order history');
    if (!account) {
      return;
    }
    getOrderHistoryQuery();
  }, [account]);

  function returnOrderHistoryRow(
    id: string,
    blockNumber: number,
    orderToName: any,
    positionHash: string,
    userAccount: string,
    status: string,
    pricePerContract: string
  ) {
    return (
      <Tr key={id}>
        <Td minW={{ base: "107px", md: "121px" }}>
          <Link
            color="blue.400"
            fontSize="11px"
            fontWeight="semibold"
            href={explorerLink(chainId, blockNumber, ExplorerDataType.BLOCK)}
            isExternal
          >
            {blockNumber}
          </Link>
        </Td>
        <Td fontWeight="medium" fontSize="xs" minW="150px">
          <Text color={orderHistoryColor}>{shortOptionName(orderToName)}</Text>
          {status === "active" && (
            <Button
              pt={2}
              variant={"link"}
              colorScheme={"sprout"}
              size="xs"
              onClick={() =>
                cancelOrderFunc(positionHash, userAccount, blockNumber)
              }
            >
              Cancel
            </Button>
          )}
        </Td>
        <Td maxWidth={"10px"} isNumeric={true}>
          <Text fontWeight="medium" fontSize="xs">
            {pricePerContract}
          </Text>
        </Td>
        <Td>
          <Tag
            size="sm"
            colorScheme={
              status === "cancelled"
                ? "red"
                : status === "expired"
                ? "gray"
                : status === "complete"
                ? "cyan"
                : status === "active"
                ? "yellow"
                : "blue"
            }
            borderRadius="full"
            fontWeight={"medium"}
          >
            <TagLabel>{status}</TagLabel>
          </Tag>
        </Td>
      </Tr>
    );
  }

  function cancelOrderFunc(
    positionHash: BytesLike,
    user: string,
    blockHeight: number
  ) {
    async function main() {
      const orders = await getAnnouncedEvent(
        library,
        positionHash,
        user,
        blockHeight
      );
      if (!orders || !orders[0]) {
        throw new Error("Order could not be found");
      }
      const order = orders[0];
      const iOrder = transformOrderAppChain(order);
      const tx = await cancelOrder(iOrder, library);
      const description = `Cancel order for ${shortOptionName(order)}`;
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      try {
        const receipt = await tx.wait();
        const toastDescription = ToastDescription(
          description,
          receipt.transactionHash,
          chainId
        );
        toast({
          title: "Transaction Confirmed",
          description: toastDescription,
          status: "success",
          isClosable: true,
          variant: "solid",
          position: "top-right",
        });
        pendingTxsDispatch({
          type: "update",
          txHash: receipt.transactionHash,
          status: "confirmed",
        });
      } catch (e: any) {
        const toastDescription = ToastDescription(
          description,
          e.transactionHash,
          chainId
        );
        toast({
          title: "Transaction Failed",
          description: toastDescription,
          status: "error",
          isClosable: true,
          variant: "solid",
          position: "top-right",
        });
        pendingTxsDispatch({
          type: "update",
          txHash: e.transactionHash || e.hash,
          status: "failed",
        });
      }
    }

    main()
      .then()
      .catch((err) => {
        handleErrorMessages({ err });
        console.error(err);
      });
  }

  function getDefaultExpiryDate() {
    const now = new Date();
    const expiryDatesString = Object.keys(contractData["SMATIC-SUSD"]);
    const filteredSortedExpiryDates = expiryDatesString
      .map((ethDate) => fromEthDate(Number(ethDate)))
      .filter((date) => date > now)
      .sort((a, b) => Number(a) - Number(b));
    return filteredSortedExpiryDates[0]
      ? toEthDate(filteredSortedExpiryDates[0]).toString()
      : "";
  }

  function processEventIntoAppOrderSigned(event: any) {
    const { common, positionHash, order, sig, eventInfo, user } = event;
    const { baseAsset, quoteAsset, strike } = common;
    const { size, fee } = order;
    const { r, s, v } = sig;
    const { transactionHash } = eventInfo;

    const expiry = fromEthDate(common.expiry.toNumber());
    const optionType = optionTypeToString(common.optionType);
    const formattedExpiry = expiry.toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
    });
    const formattedStrike = ethers.utils.formatUnits(strike, 6); // Need to divide by 1M to get the actual strike
    const nonce = order.nonce.toNumber();
    const formattedSize = ethers.utils.formatUnits(size, 18);
    const optionAction = isBuyToOptionAction(order.isBuy);
    const totalPrice = ethers.BigNumber.from(order.price);
    const unitPrice =
      Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
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
      transactionHash,
    };
    const address = user;
    appOrderSigned.address = address;
    return appOrderSigned;
  }

  const loadingBgColor = useColorModeValue("white", "dark.100");
  const spinnerColor = useColorModeValue("sprout.500", "teal.300");

  return (
    <>
      <SummaryView />
      <Center>
        <Heading mt={20}>
          {/*<Icon as={currencyIcon(chainId)} pr="2" boxSize={40}/>*/}
          sMATIC Options
        </Heading>
      </Center>
      <Container mt={30} flex="1" borderRadius="2xl">
        {!isMobile && (
          <Flex>
            <Box></Box>
            <Spacer />
            <Box>
              <Text color={livePriceColor} fontSize={"xs"} fontWeight={"bold"}>
                sMATIC Price: ${maticPrice ? maticPrice.toFixed(2) : "-"}
              </Text>
            </Box>
          </Flex>
        )}
      </Container>
      <Container
        mt={1}
        p={5}
        flex="1"
        borderRadius="2xl"
        bg={selectorBg}
        mb={8}
      >
        {expiryDates && expiryDates[0] ? (
          <>
            <Box>
              {!isMobile && (
                <Text
                  fontSize={"xs"}
                  fontWeight={"medium"}
                  mb={3}
                  color={"gray.400"}
                  display={{ sm: "none", md: "block" }}
                >
                  Expiry Date
                </Text>
              )}
              <HStack {...groupExpiry} spacing={{ base: 2, md: 5 }}>
                {expiryDates.map((expiry) => {
                  const radio = getExpiryRadioProps({ value: expiry });
                  return (
                    Number(expiry) * 1000 > Date.now() && (
                      <RadioCard key={expiry} {...radio}>
                        <Text> {formatDate(Number(expiry))}</Text>
                        {!isMobile && (
                          <Text
                            fontSize="10px"
                            display={{ sm: "none", md: "block" }}
                          >
                            {formatTime(Number(expiry))}
                          </Text>
                        )}
                      </RadioCard>
                    )
                  );
                })}
              </HStack>
            </Box>
          </>
        ) : (
          <Flex direction="column" mt={10}>
            <Center>
              <HelloBud boxSize={200} />
            </Center>
            <Center pt={6}>
              <Box as="span" fontWeight="medium" fontSize="md" color="gray.500">
                No options available yet.
              </Box>
            </Center>
          </Flex>
        )}

        <Flex mt={"8"}>
          <Box>
            {!isMobile && expiryDates && expiryDates[0] && (
              <Text
                fontSize={"xs"}
                fontWeight={"medium"}
                mb={3}
                color={"gray.400"}
                display={{ sm: "none", md: "block" }}
              >
                Option
              </Text>
            )}
            {expiryDates && expiryDates[0] && (
              <HStack {...groupOption} spacing={{ base: 2, md: 3 }}>
                {sellBuys.map((value) => {
                  const radio = getOptionRadioProps({ value });
                  return (
                    <RadioCard key={value} {...radio}>
                      {value}
                    </RadioCard>
                  );
                })}
              </HStack>
            )}
          </Box>
          <Spacer />
          <Box>
            {!isMobile && expiryDates && expiryDates[0] && (
              <Text
                fontSize={"xs"}
                fontWeight={"medium"}
                mb={3}
                color={"gray.400"}
                display={{ sm: "none", md: "block" }}
              >
                Option Type
              </Text>
            )}
            {expiryDates && expiryDates[0] && (
              <HStack {...groupOptionType} spacing={{ base: 2, md: 3 }}>
                {optionTypes.map((value) => {
                  const radio = getOptionTypeRadioProps({ value });
                  return (
                    <RadioCard key={value} {...radio}>
                      {value}
                    </RadioCard>
                  );
                })}
              </HStack>
            )}
          </Box>
        </Flex>
      </Container>
      {summaryAllLoading ? (
        <Container
          mt={1}
          px={5}
          py={3}
          flex="1"
          borderRadius="2xl"
          bg={loadingBgColor}
        >
          <Center pt={10} pb={4}>
            <Spinner
              thickness="2px"
              speed="0.65s"
              emptyColor="gray.200"
              color={spinnerColor}
              size="xl"
            />
          </Center>
          <Center>
            <Box
              as="span"
              fontWeight="medium"
              fontSize="md"
              color="gray.500"
              pb={10}
            >
              Loading options...
            </Box>
          </Center>
        </Container>
      ) : (
        optionRows
      )}
      <Heading mt={14}>
        <Center>
          <Icon as={MdHistoryToggleOff} pr="2" /> Order History
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
        {userOrderRows.length + localOrderHistoryRows.length ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Block Number</Th>
                <Th>Order</Th>
                <Th isNumeric>Price per Contract</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {localOrderHistoryRows}
              {userOrderRows}
            </Tbody>
          </Table>
        ) : (
          <Flex direction="column" mt={10}>
            <Center>
              <HelloBud boxSize={200} />
            </Center>
            <Center pt={6}>
              <Box as="span" fontWeight="medium" fontSize="md" color="gray.500">
                Your order history will show up here!
              </Box>
            </Center>
          </Flex>
        )}
      </Container>
    </>
  );
}

export default OptionsView;
