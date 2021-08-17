import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Center,
    Divider,
    Flex,
    FormLabel,
    HStack,
    Input,
    Link,
    Modal, ModalBody, ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SlideFade,
    Spacer,
    Stack, Table,
    Tag,
    TagLabel, Tbody, Td, Text, Tfoot, Th, Thead,
    Tooltip,
    Tr,
    useColorModeValue, useDisclosure,
    useRadioGroup,
    useToast
} from '@chakra-ui/react';
import {Icon} from "@chakra-ui/icons";
import {BiPhone, GiMoneyStack, MdDateRange, RiHandCoinLine} from "react-icons/all";
import RadioCard from "./Radio";
import {
    getAddressFromSignedOrder,
    getUserNonce,
    optionTypeToNumber,
    signOrder,
    toEthDate,
    getAvailableBalance,
    iOrderToPostOrder,
    matchOrders,
    optionActionToIsBuy,
    transformOrderApiApp,
    transformOrderAppChain,
    validateOrderAddress, formatDate, getSymbolFor
} from "../utils/ethMethods";
import {ethers} from "ethers";
import {useWeb3React} from "@web3-react/core";
import React, {useContext, useEffect, useState} from "react";
import {
    ApiOrder,
    AppCommon,
    GetOrdersParams,
    IOrder,
    OrderBook,
    OrderType,
    SellBuy,
    UnsignedOrder
} from "../types";
import {postOrder} from "../utils/requests";
import useFetch from "../hooks/useFetch";
import {TxContext} from "./Store";
import {ToastDescription} from "./TxMonitoring";
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import {ConnectWalletModal, getErrorMessage} from './ConnectWallet';

const { Zero } = ethers.constants;

function OptionDetails({ appCommon, sellBuy, hooks }: {
    appCommon: AppCommon,
    sellBuy: SellBuy,
    hooks: {approving: any, setApproving: any, activeHash: any, setActiveHash: any}
}) {

    const [localError, setLocalError] = useState('');
    const {
        isOpen: isOpenConnectModal,
        onClose: onCloseConnectModal
    } = useDisclosure();

    const { approving, setApproving, setActiveHash } = hooks;
    const { pendingTxs } = useContext(TxContext);
    const alertColor = useColorModeValue("gray.100", "shrub.300")
    const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
    const {active, library, account, error: web3Error} = useWeb3React();
    const {formattedStrike, formattedExpiry, baseAsset, quoteAsset, expiry, optionType, strike} = appCommon
    // Hooks
    const [amount, setAmount] = React.useState(1);
    const [price, setPrice] = React.useState('');
    const [orderBook, setOrderBook] = useState<OrderBook>({buyOrders: [], sellOrders: []})
    // Radio logic
    const radioOptions = ['BUY', 'SELL']
    const radioOrderTypes = ['Market', 'Limit']
    const [radioOption, setRadioOption] = useState<SellBuy>(sellBuy);
    const [radioOrderType, setRadioOrderType] = useState<OrderType>('Market');
    const toast = useToast();
    const {
        getRootProps: getOptionRootProps,
        getRadioProps: getOptionRadioProps,
    } = useRadioGroup({
        name: "option",
        defaultValue: sellBuy,
        onChange: (nextValue: SellBuy) => setRadioOption(nextValue),
    });

    let orderBookDepth = {buyOrderDepth: Zero, sellOrderDepth: Zero};

    const url = `${process.env.REACT_APP_API_ENDPOINT}/orders`;
    const params: GetOrdersParams = {
        baseAsset,
        quoteAsset,
        expiry: toEthDate(expiry),
        optionType: optionTypeToNumber(optionType),
        strike: strike.toString()
    }
    const options = {params};
    const {data: orderBookData, status} = useFetch<ApiOrder[]>(url, options);
    useEffect(() => {
        if (status !== 'fetched' || !orderBookData) {
            return;
        }
        // add perContract pricing
        const appOrderBookData = orderBookData.map(o => transformOrderApiApp(o));
        const buyOrders = appOrderBookData.filter(o => o.optionAction === 'BUY').sort((a, b) => b.unitPrice - a.unitPrice);
        const sellOrders = appOrderBookData.filter(o => o.optionAction === 'SELL').sort((a, b) => a.unitPrice - b.unitPrice);
        const buyOrderDepth = buyOrders.reduce((tot, order) => tot.add(order.size), Zero)
        const sellOrderDepth = sellOrders.reduce((tot, order) => tot.add(order.size), Zero)
        orderBookDepth = {buyOrderDepth, sellOrderDepth};
        console.log('sellOrders');
        console.log(sellOrders);
        setOrderBook({ sellOrders, buyOrders })
    }, [status])

    const {
        getRootProps: getOrderTypeRootProps,
        getRadioProps: getOrderTypeRadioProps,
    } = useRadioGroup({
        name: "orderType",
        defaultValue: 'Market',
        onChange: (nextValue: OrderType) => setRadioOrderType(nextValue),
    });

    const groupOption = getOptionRootProps();
    const groupOptionType = getOrderTypeRootProps();

   const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
   

    async function limitOrder() {
        try {
        setApproving(true);
        if (!active || !account) {
            setLocalError('');
            handleErrorMessages({ customMessage: 'Please connect your wallet'})
            console.error('Please connect your wallet');
            setApproving(false);
            return;
        }
        if (!price) {
            throw new Error('price is required');
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
        const unsignedOrder: UnsignedOrder = {
            size: ethers.utils.parseUnits(amount.toString(), 18),
            isBuy: optionActionToIsBuy(radioOption),
            optionType: optionTypeToNumber(optionType),
            baseAsset,
            quoteAsset,
            expiry: toEthDate(expiry),
            strike,
            price: ethers.utils.parseUnits((Number(price) * amount).toString(), 18),
            fee: ethers.utils.parseUnits('0', 18),
            offerExpire: toEthDate(oneWeekFromNow),
            nonce,
        };
            const signedOrder = await signOrder(unsignedOrder, library);
            const verifiedAddress = await getAddressFromSignedOrder(signedOrder, library);
            console.log(`verifiedAddress: ${verifiedAddress}`);
            const pOrder = iOrderToPostOrder(signedOrder);
            // TODO: handle success/failure responses
            const res = await postOrder(pOrder);
            setApproving(false);
        } catch (e) {
            handleErrorMessages({err:e});
            console.error(e);
        }
    }

    async function marketOrderMany() {
        try {
            console.log('running marketOrderMany');
            setApproving(true);
            if (!active || !account) {
                setLocalError('');
                handleErrorMessages({ customMessage: 'Please connect your wallet'})
                console.error('Please connect your wallet');
                setApproving(false);
                return;
            }
            let signedBuyOrders: IOrder[] = [];
            let signedSellOrders: IOrder[] = [];
            const localOrderBook = radioOption === 'BUY' ? orderBook.sellOrders : orderBook.buyOrders;
            const depth = localOrderBook.reduce((tot, order) => tot.add(order.size), Zero)
            const bigSize = ethers.utils.parseUnits(amount.toString(), 18);
            if (bigSize.gt(depth)) {
                throw new Error('Order size exceeds available depth in orderbook');
            }
            let remainingSize = ethers.BigNumber.from(bigSize);
            const now = new Date();
            const oneWeekFromNow = new Date(now);
            oneWeekFromNow.setUTCDate(oneWeekFromNow.getUTCDate() + 7);
            const nonce =
              (await getUserNonce({
                  address: account,
                  quoteAsset,
                  baseAsset,
              }, library)) + 1;

            // Create as many unsigned orders as needed to get the total amount up to the requested amount
            const counterPartyOrders: IOrder[] = [];

            let index = 0;
            let accumulatedPrice = Zero;
            while (remainingSize.gt(Zero)) {
                const order = localOrderBook[index];
                if (!order) {
                    throw new Error('Insufficient market depth for this order');
                }
                const { address: counterpartyAddress, nonce: orderNonce, size, totalPrice: orderPrice, unitPrice: orderUnitPrice, formattedSize: orderFormattedSize } = order;
                if (!counterpartyAddress) {
                    console.error('no counterparty address on order');
                    index++;
                    continue;
                }
                const counterPartyOrder = transformOrderAppChain(order);
                const doesAddressMatch: boolean = await validateOrderAddress(counterPartyOrder, library);
                console.log(doesAddressMatch);
                const counterpartyNonce = await getUserNonce({ address: counterpartyAddress, quoteAsset, baseAsset, }, library) + 1;
                console.log(counterpartyNonce);
                console.log(orderNonce);
                if (orderNonce !== counterpartyNonce) {
                    console.error("order nonce does not match the signer of the order's nonce");
                    index++;
                    continue;
                }
                // if buying - check the collateral of the counterparty
                if (radioOption === 'BUY') {
                    if (optionType === 'CALL') {
                        // required collateral is size of the quoteAsset
                        const balance = await getAvailableBalance({
                            address: counterpartyAddress,
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
                            address: counterpartyAddress,
                            tokenContractAddress: baseAsset,
                            provider: library
                        });
                        console.log(balance.toString());
                        if (balance.lt(price)) {
                            throw new Error("not enough collateral of baseAsset");
                        }
                    }
                }
                // TODO: If selling, check that you have sufficient collateral

                remainingSize = remainingSize.sub(order.size);
                accumulatedPrice = accumulatedPrice.add(counterPartyOrder.price);
                counterPartyOrders.push(counterPartyOrder);
                console.log('remaining size');
                console.log(ethers.utils.formatUnits(remainingSize));
                index++;
            }

            const unsignedOrder: UnsignedOrder = {
                size: bigSize,
                isBuy: optionActionToIsBuy(radioOption),
                optionType: optionTypeToNumber(optionType),
                baseAsset,
                quoteAsset,
                expiry: toEthDate(expiry),
                strike,
                // TODO: update contract so that the commented out price logic works (with partial orders)
                // price: size.lt(remainingSize) ? orderPrice : ethers.utils.parseUnits((orderUnitPrice * Number(ethers.utils.formatUnits(remainingSize, 18))).toString()),
                price: accumulatedPrice,
                fee: ethers.utils.parseUnits('0', 18),
                offerExpire: toEthDate(oneWeekFromNow),
                nonce,
            };
            // ordersToSign.push(unsignedOrder);
            const signedOrder = await signOrder(unsignedOrder, library);
            if (radioOption === 'BUY') {
                signedBuyOrders = [signedOrder];
                signedSellOrders = counterPartyOrders;
            } else {
                signedBuyOrders = counterPartyOrders;
                signedSellOrders = [signedOrder];
            }
            console.log(signedBuyOrders, signedSellOrders);
            const tx = await matchOrders(signedBuyOrders, signedSellOrders, library)
            console.log(tx);
            const quoteSymbol = await getSymbolFor(quoteAsset, library);
            const description = `${radioOption.toLowerCase()} ${amount} ${formatDate(expiry)} $${formattedStrike} ${quoteSymbol} ${optionType.toLowerCase()} options for $${ethers.utils.formatUnits(accumulatedPrice, 18)}`;
            pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
            setActiveHash(tx.hash);
            console.log(pendingTxsState);
            try {
                const receipt = await tx.wait()
                const toastDescription = ToastDescription(description, receipt.transactionHash);
                toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
            } catch (e) {
                const toastDescription = ToastDescription(description, e.transactionHash);
                toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
            }
            console.log(pendingTxsState);

        } catch (e) {
            setApproving(false);
            handleErrorMessages({ err: e})
            console.error(e);
        }
    }

    // TODO: get the symbols dynamically
    const tooltipLabel = `This option gives the right to ${optionType === 'CALL' ? 'buy' : 'sell'} ETH for ${formattedStrike} FK up until ${formattedExpiry}`;

    const orderbookSellRows: JSX.Element[] = [];
    const orderbookBuyRows: JSX.Element[] = [];
    orderBook.sellOrders
      .sort((a,b) => b.unitPrice - a.unitPrice)
      .slice(-10)
      .forEach((sellOrder, index) => {
        if (index > 5) {
            return;
        }
        orderbookSellRows.push(<Tr key={index}>
            <Td>{`$${sellOrder.unitPrice.toFixed(4)}`}</Td>
            <Td isNumeric={true}>{sellOrder.formattedSize}</Td>
        </Tr>)
    });
    orderBook.buyOrders
      .sort((a,b) => b.unitPrice - a.unitPrice)
      .slice(0, 10)
      .forEach((buyOrder, index) => {
          if (index > 5) {
              return;
          }
          orderbookBuyRows.push(<Tr key={index} color={Number(price) > buyOrder.unitPrice ? "orange": "white"}>
              <Td>{`$${buyOrder.unitPrice.toFixed(4)}`}</Td>
              <Td>{buyOrder.formattedSize}</Td>
          </Tr>)
      });

    function changePrice(value: string) {
        setPrice(value)
    }

    return (
      <>
          {localError &&
          <>
              <SlideFade in={true} unmountOnExit={true}>
                  <Flex>
                      <Alert status="error" borderRadius={"2xl"} my={4}>
                            <AlertIcon/>
                            {!!web3Error ? getErrorMessage(web3Error).message : localError}
                        </Alert>
                    </Flex>
                </SlideFade>
            </>
            }
            <Modal motionPreset="slideInBottom" isOpen={isOpenConnectModal}
                   onClose={onCloseConnectModal}>
                <ModalOverlay/>
                <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="15">
                    <ModalHeader>
                        <Text fontSize={20}>Connect to a wallet</Text>
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <ConnectWalletModal/>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Flex>
                <Box id={"order form"}>
                    <Stack spacing="24px">
                        <Box mt={2} mb={8}>
                            <HStack spacing={3}>
                                <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800">
                                    <Tag colorScheme="purple">
                                        <Icon as={optionType === 'CALL' ? BiPhone : RiHandCoinLine} />
                                        <TagLabel>{optionType}</TagLabel>
                                    </Tag>
                                </Tooltip>
                                <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800">
                                    <Tag colorScheme="blue">
                                        <Icon as={MdDateRange} />
                                        <TagLabel> {formattedExpiry}</TagLabel>
                                    </Tag>
                                </Tooltip>
                                <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800">
                                    <Tag colorScheme="yellow">
                                        <Icon as={GiMoneyStack} />
                                        <TagLabel>{`${formattedStrike} USDC`}</TagLabel>
                                    </Tag>
                                </Tooltip>
                            </HStack>
                        </Box>
                        <Box>
                            <HStack {...groupOptionType}>
                                <FormLabel htmlFor="orderType">Order:</FormLabel>
                                {radioOrderTypes.map((value) => {
                                    const radio = getOrderTypeRadioProps({ value });
                                    return (
                                      <RadioCard key={value} {...radio}>
                                          {value}
                                      </RadioCard>
                                    );
                                })}
                            </HStack>
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
                            <FormLabel htmlFor="bid">Price per contract:</FormLabel>
                            <Input
                              id="bid"
                              placeholder="The USDC required to purchase 1 contract (1 ETH)"
                              value={price}
                              onChange={(event: any) => changePrice(event.target.value)}
                            />
                        </Box>
                        <Alert status="info" borderRadius={"2xl"} bgColor={alertColor}>
                            <AlertIcon />
                            {tooltipLabel}
                        </Alert>
                        <Box>
                            <Flex justifyContent="flex-end">
                                <Button
                                  colorScheme="teal"
                                  type="submit"
                                  onClick={radioOrderType === 'Limit' ? limitOrder : marketOrderMany}
                                  isLoading={approving}
                                  loadingText="Placing Order"
                                >
                                    Place Order
                                </Button>
                            </Flex>
                        </Box>
                    </Stack>

                </Box>

                <Box id={"orderbook"} ml={4}>
                    <Table variant={'unstyled'} size={'sm'}>
                        <Thead>
                            <Tr>
                                <Th>Price</Th>
                                <Th>Amount</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {orderbookSellRows}
                        </Tbody>
                    </Table>
                    <Divider/>
                    <Table variant={'unstyled'} size={'sm'}>
                        <Tbody>
                            {orderbookBuyRows}
                        </Tbody>
                        <Tfoot>
                            <Th>Price</Th>
                            <Th>Amount</Th>
                        </Tfoot>
                    </Table>
                </Box>
            </Flex>
        </>
    )
}

export default OptionDetails;
