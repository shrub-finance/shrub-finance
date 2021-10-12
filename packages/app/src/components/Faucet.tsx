import {
  Alert, AlertIcon, Box, Button, FormControl, FormLabel, HStack, InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay, NumberInput, NumberInputField,
  SlideFade,
  Stack, useDisclosure, useRadioGroup, useToast,
} from '@chakra-ui/react'
import RadioCard from './Radio'
import { ToastDescription, Txmonitor } from './TxMonitoring'
import React, { useContext, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { handleErrorMessagesFactory } from '../utils/handleErrorMessages'
import { buyFromFaucet, depositEth } from '../utils/ethMethods'
import { ethers } from 'ethers'
import { TxContext } from './Store'

function Faucet() {
  // Constants
  const faucetCurrencies = new Map<'SUSD'|'SMATIC', string>();
  faucetCurrencies.set('SUSD', process.env.REACT_APP_SUSD_TOKEN_ADDRESS || '')
  faucetCurrencies.set('SMATIC', process.env.REACT_APP_SMATIC_TOKEN_ADDRESS || '')
  const radioOptions = ['BUY', 'SELL']
  const currencyArray = ['SUSD', 'SMATIC'];

  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");


  // Hooks
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const {isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal} = useDisclosure();
  const [activeHash, setActiveHash] = useState<string>();
  const [localError, setLocalError] = useState('');
  const [amountValue, setAmountValue] = useState("0.01");
  const {active, library, account, error: web3Error, chainId} = useWeb3React();
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const [modalCurrency, setModalCurrency] = useState<'SUSD'|'SMATIC'>('SUSD');
  const [option, setRadioOption] = useState<string>('BUY');
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'currency',
    defaultValue: modalCurrency,
    onChange: (value: 'SUSD'|'SMATIC') => setModalCurrency(value)
  })
  const {
    getRootProps: getOptionRootProps,
    getRadioProps: getOptionRadioProps,
  } = useRadioGroup({
    name: "option",
    defaultValue: 'BUY',
    onChange: (value) => setRadioOption(value),
  });
  const toast = useToast();
  const currenciesRadiogroup = getRootProps();
  const groupOption = getOptionRootProps();

  async function handleFaucet(event: any) {
    try {
      if (!active || !account) {
        handleErrorMessages({customMessage: 'Please connect your wallet'});
        return;
      }
      let tx;
      const tokenAddress = faucetCurrencies.get(modalCurrency);
      if (!tokenAddress) {
        return;
      }
      if (option === 'BUY') {
        tx = await buyFromFaucet(tokenAddress, ethers.utils.parseUnits(amountValue), library)
        const description =  `BUYING ${modalCurrency} for ${amountValue} MATIC`;
        pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
        setActiveHash(tx.hash);
        try {
          const receipt = await tx.wait()
          const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
          toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
          pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
        } catch (e) {
          const toastDescription = ToastDescription(description, e.transactionHash, chainId);
          pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
          toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
        }
      }

    } catch (e) {
      handleErrorMessages({err: e})
    }
  }



  return (
      <>
        <Stack direction={["column"]} spacing="40px" mb="40px">
          {localError && (
            <SlideFade in={true} unmountOnExit={true}>
              <Alert status="error" borderRadius={9} >
                <AlertIcon />
                {localError}
              </Alert>
            </SlideFade>
          )
          }
          <Box>
            <FormControl id="faucetCurrency">
              <FormLabel>Token I want:</FormLabel>
              <HStack {...currenciesRadiogroup}>
                {currencyArray.map((value) => {
                  const radio = getRadioProps({ value })
                  return (
                    <RadioCard key={value} {...radio}>
                      {value}
                    </RadioCard>
                  )
                })}
              </HStack>
            </FormControl>
          </Box>

        <FormControl id="amount">
          <FormLabel>MATIC I will pay:</FormLabel>
          <NumberInput
            onChange={(valueString) => setAmountValue(parse(valueString))}
            value={format(amountValue)} size="lg"
          >
            <NumberInputField/>
          </NumberInput>
        </FormControl>
          <FormControl id="amount">
            <FormLabel>{modalCurrency} I will get:</FormLabel>
            <NumberInput isDisabled
              onChange={(valueString) => setAmountValue(parse(valueString))}
              value={format((10000 * Number(amountValue)).toString())} size="lg"
            >
              <NumberInputField/>
            </NumberInput>
          </FormControl>
        </Stack>
        <Button mb={1.5} size={"lg"} colorScheme="teal" isFullWidth={true} isDisabled={amountValue === '0' || amountValue === ''} onClick={handleFaucet}>
          Exchange
        </Button>
      </>
  )
}

export default Faucet;


