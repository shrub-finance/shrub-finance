import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  HStack,
  NumberInput,
  NumberInputField,
  SlideFade,
  Text,
  Stack,
  useColorModeValue,
  useRadioGroup,
  useToast,
  Flex,
  Link,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton, PopoverBody, Popover, InputRightElement, VStack, Spacer,
} from '@chakra-ui/react'
import RadioCard from './Radio'
import { ToastDescription } from './TxMonitoring'
import React, { useContext, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { handleErrorMessagesFactory } from '../utils/handleErrorMessages'
import { buyFromFaucet } from '../utils/ethMethods'
import { ethers } from 'ethers'
import {TxContext} from './Store'
import {SUSDIcon, PolygonIcon, HappyBud} from "../assets/Icons";
import {CheckCircleIcon, ExternalLinkIcon, Icon, UpDownIcon} from "@chakra-ui/icons";
import useAddNetwork from "../hooks/useAddNetwork";
import {AiOutlineArrowDown, AiOutlineSwap } from 'react-icons/ai'
import {BsArrowDownShort, BsFunnel, FaFaucet, FiArrowDown, IoSwapVertical} from "react-icons/all";
import {Balance} from "./ConnectWallet";



function Faucet({hooks} : {hooks: {isBuyingSUSD: any, setIsBuyingSUSD: any}}) {

  // Constants
  const faucetCurrencies = new Map<'SUSD'|'SMATIC', string>();
  faucetCurrencies.set('SUSD', process.env.REACT_APP_SUSD_TOKEN_ADDRESS || '')
  faucetCurrencies.set('SMATIC', process.env.REACT_APP_SMATIC_TOKEN_ADDRESS || '')
  const radioOptions = ['BUY', 'SELL']
  const currencyArray = ['SUSD', 'SMATIC'];

  const bg = useColorModeValue("sprout", "teal");
  const polygonFaucetLinkColor = useColorModeValue("blackAlpha.500", "whiteAlpha.500")

  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");

  const { isBuyingSUSD, setIsBuyingSUSD } = hooks;

  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [localError, setLocalError] = useState('');
  const [amountValue, setAmountValue] = useState("0.01");
  const [faucetDrop, setFaucetDrop] = useState(false);
  const {active, library, account, error: web3Error, chainId} = useWeb3React();
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const [modalCurrency, setModalCurrency] = useState<'SUSD'|'SMATIC'>('SUSD');
  const [option, setRadioOption] = useState<string>('BUY');
  const bgColor = useColorModeValue("gray.100", "blackAlpha.400");
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

  const linkColor = useColorModeValue("blue","blue.100");
  const popOverColor = useColorModeValue("blue.500", "blue.200");

  async function handleFaucet(event: any) {
    setFaucetDrop(false);
    setLocalError('');
    try {
      if (!active || !account) {
        handleErrorMessages({customMessage: 'Please connect your wallet'});
        return;
      }
      let tx;
      const tokenAddress = faucetCurrencies.get((modalCurrency));
      if (!tokenAddress) {
        return;
      }
      if (option === 'BUY') {
        setIsLoading(true);
        tx = await buyFromFaucet(tokenAddress, ethers.utils.parseUnits(amountValue), library)
        const currency = modalCurrency === 'SMATIC' ? 'sMATIC' : 'sUSD';
        const description =  `Buying ${currency} for ${amountValue} MATIC`;
        pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
        setActiveHash(tx.hash);
        try {
          const receipt = await tx.wait()
          const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
          toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
          pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
          setIsLoading(false);
          setFaucetDrop(true);
        // add token to metamask
          const tokenImage = modalCurrency === "SMATIC" ? "https://shrub.finance/smatic.svg" : "https://shrub.finance/susd.svg";
          const tokenSymbol = modalCurrency === 'SMATIC' ? 'sMATIC' : 'sUSD'
          try {
            // @ts-ignore
            window.ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address: tokenAddress,
                  symbol: tokenSymbol,
                  decimals: 18,
                  image: tokenImage,
                },
              },
            }).then(
                // @ts-ignore
                (success) => {
              if (success) {
                console.log('Test Shrub token successfully added to wallet!')
              } else {
                throw new Error('Something went wrong.')
              }
            })
            .catch(console.error)
          } catch (e) {
            console.log(e);
            handleErrorMessages({err: e});
          }
        } catch (e) {
          setIsLoading(false);
          handleErrorMessages({err: e});
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

const addNetwork = useAddNetwork();

  return (
      <>
        <Stack direction="column" spacing="40px" mb="40px" >
          {localError && (
            <SlideFade in={true} unmountOnExit={true}>
              <Alert status="error" borderRadius={9} >
                <AlertIcon />
                {localError}
              </Alert>
            </SlideFade>
          )}
          {faucetDrop ?
                  <Flex direction="column">
                    <Center py={8}>
                      <Text fontSize="2xl">All Done!</Text>
                    </Center>
                    <Center>
                      <HappyBud boxSize={60}/>
                </Center>

                  </Flex> :
              <>
                 <Center>
                   <Link fontSize='xs' fontWeight="extrabold" color={polygonFaucetLinkColor} href="https://faucet.polygon.technology/" isExternal>
                  Get test MATIC from the Polygon faucet<ExternalLinkIcon mx="2px" />
                </Link>
                 </Center>
                 {!isBuyingSUSD && <FormControl id="faucetCurrency">
                  <Center>
                  <HStack {...currenciesRadiogroup}>
                    {currencyArray.map((value) => {
                      const radio = getRadioProps({ value })
                      return (
                          <RadioCard key={value} {...radio}>
                            {value === 'SMATIC' ? 'sMATIC' : 'sUSD'}
                          </RadioCard>
                      )
                    })}
                  </HStack>
                  </Center>
                </FormControl>}
                <VStack>
                  <Box>
                    <Center><FormLabel fontSize={'sm'} color={'gray.500'} fontWeight={'semibold'}>You send</FormLabel></Center>
                    <NumberInput
                      isInvalid={invalidEntry}
                      onChange={(valueString) => {
                        const [integerPart, decimalPart] = valueString.split('.');
                        if(valueString === '.') {
                          setAmountValue('0.')
                          return;
                        }
                        if (decimalPart && decimalPart.length > 6) {
                          return;
                        }
                        if (integerPart && integerPart.length > 6) {
                          return;
                        }
                        if (valueString === '00') {
                          return;
                        }
                        if (isNaN(Number(valueString))) {
                          return;
                        }
                        if (Number(valueString) !== Math.round(Number(valueString) * 1e6) / 1e6) {
                          setAmountValue(Number(valueString).toFixed(6))
                          return;
                        }
                        setAmountValue(valueString);
                      }}
                      value={format(amountValue)} size="lg"
                    >
                      <NumberInputField h="6rem" borderRadius="3xl" shadow="sm" fontWeight="bold" fontSize="2xl"/>
                      <InputRightElement pointerEvents="none" p={14} children={
                        <FormLabel htmlFor="amount" color="gray.500" fontWeight="bold" minW={"100"}>test MATIC</FormLabel>
                      }/>
                    </NumberInput>
                  </Box>
                  <Box>
                    <Center><Icon as={BsArrowDownShort} boxSize={8}/></Center>
                  </Box>
                  <Box>
                    <Center><FormLabel fontSize={'sm'} color={'gray.500'} fontWeight={'semibold'}>You receive</FormLabel></Center>
                    <Box bg={bgColor} borderRadius="3xl" fontWeight="bold" fontSize="2xl"  p={"1.813rem"}>
                      { modalCurrency === "SMATIC" ? <PolygonIcon/> : <SUSDIcon/> } {invalidEntry ? '?' : format((10000 * Number(amountValue)).toString())} {modalCurrency === "SMATIC" ? 'sMATIC' : 'sUSD'}
                    </Box>
                  </Box>

                </VStack>

            <Button mb={1.5} size={"lg"} rounded="2xl" colorScheme={bg} isFullWidth={true} isDisabled={amountValue <= '0' || amountValue === ''} onClick={handleFaucet} isLoading={isLoading}>
            Get {modalCurrency === 'SUSD' ? 'sUSD' : 'sMATIC'}
            </Button>
            </>
          }
        </Stack>
      </>
  )
}

export default Faucet;


