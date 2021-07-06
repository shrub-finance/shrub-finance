import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import {
  Stack,
  VisuallyHidden,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Box,
  TableRowProps,
  Flex,
  Spacer,
  SlideFade,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Text,
  ModalCloseButton,
  ModalBody, VStack, StackDivider, HStack
} from "@chakra-ui/react";

import {
  depositEth,
  depositToken,
  withdraw,
  approveToken,
  getFilledOrders,
  getAvailableBalance,
  exercise,
  signOrder,
  getLockedBalance
} from "../utils/ethMethods";
import WithdrawDeposit from "./WithdrawDeposit";
import {Balance, OrderCommon, ShrubBalance, SmallOrder} from "../types";
import { Currencies } from "../constants/currencies";
import {useWeb3React} from "@web3-react/core";
import ConnectWalletsView from "./ConnectWallet";

function Positions({ walletBalance }: { walletBalance: Balance }) {

  function handleErrorMessages(err?: Error, message?:string) {
    if(err) {
      // @ts-ignore
      setError(err.message);
      console.log(err);
    } else if(message) {
      setError(message);
    }
  }

  const { active, library, account } = useWeb3React();
  const tableRows:TableRowProps[] = [];
  const tableRowsOptions:any = [];
  const [action, setAction] = useState('');

  const [optionsRows, setOptionsRows] = useState(<></>)
  const [error, setError] = useState('')
  const [shrubBalance, setShrubBalance] = useState({locked: {}, available: {}} as ShrubBalance);

  const orderMap = new Map();

  useEffect(() => {
    setError('');
    async function inner() {
      if (!active || !account) {
        setError('');
        handleErrorMessages(undefined, 'Please connect your wallet')
        console.error('Please connect wallet');
        return;
      }
      const shrubBalanceObj:ShrubBalance = {locked: {}, available:{}};
      for (const currencyObj of Object.values(Currencies)) {
        const {symbol, address: tokenContractAddress} = currencyObj;
        const bigBalance = await getAvailableBalance({address: account, tokenContractAddress, provider: library})
        const bigLockedBalance = await getLockedBalance(account, tokenContractAddress, library);
        const balance = ethers.utils.formatUnits(bigBalance, 18);
        const lockedBalance = ethers.utils.formatUnits(bigLockedBalance, 18);
        shrubBalanceObj.available[symbol] = Number(balance);
        shrubBalanceObj.locked[symbol] = Number(lockedBalance);
      }
      setShrubBalance(shrubBalanceObj)
    }
    inner()
    .catch(console.error);
  }, [active, account, library]);


  useEffect(() => {
    setError('');
    async function inner() {
      if (!active || !account) {
        handleErrorMessages(undefined, 'Please connect your wallet')
        console.error('Please connect wallet');
        return;
      }
      const filledOrders = await getFilledOrders(account, library);
      // Populate Option Positions Table
      for (const details of Object.values(filledOrders)) {
        const {pair, strike, expiry, optionType, amount, common, buyOrder, seller}
            = details as
            { baseAsset: string,
              quoteAsset: string,
              pair: string,
              strike: string,
              expiry: string,
              optionType:string,
              amount:number,
              common: OrderCommon,
              buyOrder: SmallOrder,
              seller: string
            };
        orderMap.set(`${pair}${strike}${expiry}${optionType}`, {common, buyOrder, seller});
        tableRowsOptions.push(
            <Tr>
              <Td>{pair}</Td>
              <Td>{strike}</Td>
              <Td>{expiry}</Td>
              <Td>{optionType}</Td>
              <Td>{amount}</Td>
              <Td>
                {amount > 0 && <Button
                    colorScheme="teal"
                    size="xs"
                    onClick={() => handleClickExercise(pair, strike, expiry, optionType)}
                >
                  Exercise
                </Button>
                }
              </Td>
            </Tr>
        )
      }
      setOptionsRows(tableRowsOptions);
    }
    inner()
    .catch(console.error);
  }, [active, account, library])


  const {
    isOpen: isOpenDrawer,
    onOpen: onOpenDrawer,
    onClose: onCloseDrawer
  } = useDisclosure();

  const {
    isOpen: isOpenConnectModal,
    onOpen: onOpenConnectModal,
    onClose: onCloseConnectModal
  } = useDisclosure();


  const [amountValue, setAmountValue] = useState("0");

  const [drawerCurrency, setDrawerCurrency] = useState(
    'ETH' as keyof typeof Currencies
  );


  function handleClickFactory(selectedCurrency: any, buttonText?: any) {
    return (
       function handleClick() {
         onOpenDrawer();
         setAction(buttonText);
         setError('');
         setAmountValue('');
         setDrawerCurrency(selectedCurrency);
       })
  }

  async function handleClickExercise(pair: string, strike: string, expiry:string, optionType:string) {
    const key = `${pair}${strike}${expiry}${optionType}`
    const {common, buyOrder, seller} = orderMap.get(key);
    const unsignedOrder = { ...common, ...buyOrder };
    const signedOrder = await signOrder(unsignedOrder, library)
    const exercised = await exercise(signedOrder, seller, library)
    return exercised;
  }

  function totalUserBalance(currency: string) {
    return shrubBalance.locked[currency] + shrubBalance.available[currency];
  }

  // Populate Balance Table
  for (const currency of Object.keys(Currencies)) {
    tableRows.push(
      <Tr key={currency}>
        <Td>{currency}</Td>
        <Td>{totalUserBalance(currency)}</Td>
        <Td>{shrubBalance.locked[currency]}</Td>
        <Td>{shrubBalance.available[currency]}</Td>
        <Td>
          <HStack spacing="24px">
            <Button
              colorScheme="teal"
              variant="outline"
              size="xs"
              borderRadius="2xl"
              onClick={handleClickFactory(currency, 'Withdraw')}
              isDisabled={!active}
            >
              Withdraw
            </Button>
            <Button
              colorScheme="teal"
              variant="outline"
              size="xs"
              borderRadius="2xl"
              onClick={handleClickFactory(currency, 'Deposit')}
              isDisabled={!active}
            >
              Deposit
            </Button>
          </HStack>
        </Td>
      </Tr>
    );
  }

  return (
      <>
        {error && (!active || !account) && (
          <>
            <SlideFade in={true} unmountOnExit={true}>
              <Flex>
              <Alert status="warning" borderRadius={7} mb={6} >
                <AlertIcon />
                {error}
                <Spacer />
                  <Button colorScheme="yellow" variant="outline" size="sm" onClick={onOpenConnectModal}>
                    Connect Wallet
                  </Button>
              </Alert>
              </Flex>
            </SlideFade>
                <Modal isOpen={isOpenConnectModal} onClose={onCloseConnectModal}>
                  <ModalOverlay />
                  <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="15">
                    <ModalHeader>
                      <Text fontSize={20}>Connect to a wallet</Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <ConnectWalletsView />
                    </ModalBody>
                  </ModalContent>
                </Modal>
            </>
        )}

          <Table variant="simple" size="lg">
            <Thead>
              <Tr>
                <Th>Asset</Th>
                <Th>Total</Th>
                <Th>Locked</Th>
                <Th>Unlocked</Th>
                <Th>
                  <VisuallyHidden/>
                </Th>
              </Tr>
            </Thead>
            <Tbody>{tableRows}</Tbody>
          </Table>



          <Table variant="simple" size="lg">
            <Thead>
              <Tr>
                <Th>Pair</Th>
                <Th>Strike</Th>
                <Th>Expiry</Th>
                <Th>Option Type</Th>
                <Th>Amount</Th>
                <Th>
                  <VisuallyHidden/>
                </Th>
              </Tr>
            </Thead>
            <Tbody>{optionsRows}</Tbody>
          </Table>

     <Drawer onClose={onCloseDrawer} isOpen={isOpenDrawer} placement="right">
    <DrawerOverlay/>
    <DrawerContent fontFamily="Montserrat" borderRadius="2xl">
      <DrawerHeader>{action}</DrawerHeader>
      <DrawerCloseButton/>
      <DrawerBody>
        <WithdrawDeposit
            amountValue={amountValue}
            setAmountValue={setAmountValue}
            drawerCurrency={drawerCurrency}
            setDrawerCurrency={setDrawerCurrency}
            walletBalance={walletBalance}
            shrubBalance={shrubBalance}
            action={action}
            error={error}
        />
        <Flex>
          {drawerCurrency !== "ETH" && action === "Deposit" ? (
              <Button
                  colorScheme="teal"
                  isDisabled={amountValue === '0' || amountValue === ''}
                  onClick={() => {
                    if (active) {
                      approveToken(
                          Currencies[drawerCurrency].address,
                          ethers.utils.parseUnits(amountValue),
                          library
                      ).catch(handleErrorMessages)
                    }
                  }
                  }
              >
                Approve
              </Button>
          ) : null}
          <Spacer/>
          <Button
              colorScheme="teal"
              isDisabled={amountValue === '0' || amountValue === ''}
              onClick={() => {
                if (!active || !account) {
                  handleErrorMessages(undefined,'Please connect your wallet');
                  return;
                }
                if (action === "Deposit") {
                  if (drawerCurrency === "ETH") {
                    depositEth(ethers.utils.parseUnits(amountValue), library
                    ).catch(handleErrorMessages);
                  } else {
                    depositToken(
                        Currencies[drawerCurrency].address,
                        ethers.utils.parseUnits(amountValue),
                        library
                    ).catch(handleErrorMessages);
                  }
                } else if (action === "Withdraw") {
                  withdraw(
                      Currencies[drawerCurrency].address,
                      ethers.utils.parseUnits(amountValue),
                      library
                  ).catch(handleErrorMessages);
                }
              }}
          >
            {action}
          </Button>
        </Flex>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
      </>
);
}

export default Positions;
