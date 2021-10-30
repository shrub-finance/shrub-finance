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
  PopoverCloseButton, PopoverBody, Popover,
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
import {CheckCircleIcon, ExternalLinkIcon} from "@chakra-ui/icons";
import useAddNetwork from "../hooks/useAddNetwork";



function Faucet() {

  // Constants
  const faucetCurrencies = new Map<'SUSD'|'SMATIC', string>();
  faucetCurrencies.set('SUSD', process.env.REACT_APP_SUSD_TOKEN_ADDRESS || '')
  faucetCurrencies.set('SMATIC', process.env.REACT_APP_SMATIC_TOKEN_ADDRESS || '')
  const radioOptions = ['BUY', 'SELL']
  const currencyArray = ['sUSD', 'sMATIC'];

  const bg = useColorModeValue("green", "teal");

  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");


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
  const bgColor = useColorModeValue("gray.100", "gray.400");
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
        <Stack direction={["column"]} spacing="40px" mb="40px">
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
              <Box>
                <Box pb={4}>
                  <Link fontSize='xs' fontWeight="extrabold" letterSpacing='wide' color={linkColor} href="https://faucet.polygon.technology/" isExternal>
                  Don't have test MATIC? Get some from the Polygon faucet<ExternalLinkIcon mx="2px" />
                </Link>
                </Box>
                <FormControl id="faucetCurrency">
                  <FormLabel fontSize={'sm'} color={'gray.500'} fontWeight={'semibold'}>Select a test Shrub token<Popover>
                    <PopoverTrigger>
                      <Text ml="1" color={popOverColor} as="sup" cursor="pointer">What's this?</Text>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverBody letterSpacing="wide">
                        <Text> To facilitate testing with reasonable amounts of tokens, we have created sMATIC and sUSD.</Text> <Text>These represent MATIC and USD stable coin in our test environment.</Text> <Text>Options in the test environment have these as their underlying assets.</Text><Text> You may buy sMATIC and sUSD at a rate of 10,000/test MATIC.</Text>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover></FormLabel>
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
            <FormLabel fontSize={'sm'} color={'gray.500'} fontWeight={'semibold'}>Enter test MATIC you want to spend</FormLabel>
            <NumberInput
            isInvalid={invalidEntry}
            onChange={(valueString) => setAmountValue(parse(valueString))}
            value={format(amountValue)} size="lg"
            >
            <NumberInputField/>
            </NumberInput>
            </FormControl>
            <FormControl id="tokenAmount">
            <FormLabel fontSize={'sm'} color={'gray.500'} fontWeight={'semibold'}>Test Shrub token you get for {invalidEntry ? '' : amountValue} test MATIC</FormLabel>
            <Box fontWeight={"bold"} fontSize={"lg"} bg={bgColor} p={3} borderRadius={6} color="black">
              { modalCurrency === "SMATIC" ? <PolygonIcon/> : <SUSDIcon/> } {invalidEntry ? '?' : format((10000 * Number(amountValue)).toString())} {modalCurrency}
            </Box>
            </FormControl>
            <Button mb={1.5} size={"lg"} colorScheme={bg} isFullWidth={true} isDisabled={amountValue <= '0' || amountValue === ''} onClick={handleFaucet} isLoading={isLoading}>
            Buy {modalCurrency === 'SUSD' ? 'sUSD' : 'sMATIC'}
            </Button>
            </>
          }
        </Stack>
      </>
  )
}

export default Faucet;


