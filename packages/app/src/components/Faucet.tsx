import {
  Alert, AlertIcon, Box, Button, FormControl, FormLabel, HStack, NumberInput, NumberInputField,
  SlideFade,
  Stack, useColorModeValue, useDisclosure, useRadioGroup, useToast,
} from '@chakra-ui/react'
import RadioCard from './Radio'
import { ToastDescription } from './TxMonitoring'
import React, { useContext, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { handleErrorMessagesFactory } from '../utils/handleErrorMessages'
import { buyFromFaucet } from '../utils/ethMethods'
import { ethers } from 'ethers'
import { TxContext } from './Store'
import { SUSDIcon } from "../assets/Icons";

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
  const [isLoading, setIsLoading] = useState(false);
  const invalidEntry = Number(amountValue)<0 ||isNaN(Number(amountValue));

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
        setIsLoading(true);
        tx = await buyFromFaucet(tokenAddress, ethers.utils.parseUnits(amountValue), library)
        const description =  `BUYING ${modalCurrency} for ${amountValue} MATIC`;
        pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
        setActiveHash(tx.hash);
        try {
          const receipt = await tx.wait()
          const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
          toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
          pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
          setIsLoading(false);
        } catch (e) {
          setIsLoading(false);
          const toastDescription = ToastDescription(description, e.transactionHash, chainId);
          pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
          toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
        }
      }

    } catch (e) {
      setIsLoading(false);
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
              <FormLabel>Which token would you like to get?</FormLabel>
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

        <FormControl id="maticAmount">
          <FormLabel>How much MATIC do you want to swap?</FormLabel>
          <NumberInput
              isInvalid={invalidEntry}
            onChange={(valueString) => setAmountValue(parse(valueString))}
            value={format(amountValue)} size="lg"
          >
          <NumberInputField/>
          </NumberInput>
        </FormControl>
          <FormControl id="tokenAmount">
            <FormLabel>Token amount you get for {invalidEntry ? '' : amountValue} MATIC:</FormLabel>
            <Box fontWeight={"bold"} fontSize={"lg"} bg={useColorModeValue("gray.100", "gray.400")} p={3} borderRadius={6}
            color={useColorModeValue("black", "black")}>
             <SUSDIcon/> {invalidEntry ? '?' : format((10000 * Number(amountValue)).toString())} {modalCurrency}
            </Box>
          </FormControl>
        </Stack>
        <Button mb={1.5} size={"lg"} colorScheme="teal" isFullWidth={true} isDisabled={amountValue <= '0' || amountValue === ''} onClick={handleFaucet} isLoading={isLoading}>
          Swap
        </Button>
      </>
  )
}

export default Faucet;


