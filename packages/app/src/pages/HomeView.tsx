import {
  Box,
  Heading,
  Text,
  Button,
  Center,
  useColorModeValue,
  Container,
  Flex,
  Spacer,
  Circle,
  Stack,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  ListItem,
  PopoverBody,
  PopoverCloseButton,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Popover,
  UnorderedList,
  useToast,
  SlideFade,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  useRadioGroup,
  useBoolean,
  Link,
} from "@chakra-ui/react";
import {
  ArrowForwardIcon,
  CheckIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import { PolygonIcon } from "../assets/Icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import useAddNetwork from "../hooks/useAddNetwork";
import { isMobile } from "react-device-detect";
import Faucet from "../components/Faucet";
import { useWeb3React } from "@web3-react/core";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { TxStatusList } from "../components/TxMonitoring";
import { BigNumber, ethers } from "ethers";
import {
  approveToken,
  depositEth,
  depositToken,
  getAllowance,
  getAvailableBalance,
  getBigWalletBalance,
  getLockedBalance,
  getWalletBalance,
  withdraw,
} from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import { ToastDescription, Txmonitor } from "../components/TxMonitoring";
import { ShrubBalance, SupportedCurrencies } from "../types";
import { Currencies } from "../constants/currencies";

const { Zero } = ethers.constants;

function HomeView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const {
    isOpen: isTestTokenModalOpen,
    onOpen: onTestTokenModalOpen,
    onClose: onTestTokenModalClose,
  } = useDisclosure();
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const addNetwork = useAddNetwork();
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const toast = useToast();
  const connectedColor = useColorModeValue("green.100", "teal.500");
  const bgConnect = useColorModeValue("white", "dark.100");
  const questionColor = useColorModeValue("blue", "yellow.300");
  const stepsColor = useColorModeValue("white", "black");
  const connectedStepColor = useColorModeValue("green.400", "white");
  const stepsBg = useColorModeValue("yellow.300", "gray.500");
  const connectedStepBg = useColorModeValue("white", "dark.100");
  const tradingBtnColor = useColorModeValue("sprout", "teal");
  const mobileStepsBtnBg = useColorModeValue(
    "linear(to-r, sprout.200, teal.200)",
    "linear(to-l, blue.700, teal.700)"
  );
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };
  const [isHidden, setIsHidden] = useState(false);
  const [isBuyingSUSD, setIsBuyingSUSD] = useBoolean();

  // Copied from OptionDetails
  const {
    active,
    library,
    account,
    error: web3Error,
    chainId,
  } = useWeb3React();
  const [balances, setBalances] = useState<{
    shrub: { baseAsset: BigNumber; quoteAsset: BigNumber };
    wallet: { baseAsset: BigNumber; quoteAsset: BigNumber };
    optionPosition: BigNumber;
  }>();

  function openTestFaucetModal() {
    setIsBuyingSUSD.on();
    onTestTokenModalOpen();
  }

  function handleConnect() {
    if (!account) {
      if (!!web3Error && getErrorMessage(web3Error).title === "Wrong Network") {
        return addNetwork();
      } else {
        return onConnectWalletOpen();
      }
    }

    console.log(addNetwork);
    return addNetwork();
  }

  // Get balances
  useEffect(() => {
    const quoteAsset = "0x6b1eDb6Da018865efc22cF7d2574c7b878e2E445"; // sMATIC
    const baseAsset = "0x7891337f1360713c47240Ac94d31a3FF25D62c9D"; // sUSD

    console.log("useEffect - 1 - get balances");
    async function main() {
      if (!account) {
        return;
      }
      await setTimeout(() => Promise.resolve(), 50);
      const bigQuoteAssetBalanceShrub = await getAvailableBalance({
        address: account,
        tokenContractAddress: quoteAsset,
        provider: library,
      });
      const bigBaseAssetBalanceShrub = await getAvailableBalance({
        address: account,
        tokenContractAddress: baseAsset,
        provider: library,
      });
      const { bigBalance: bigQuoteAssetBalanceWallet } =
        await getBigWalletBalance(quoteAsset, library);
      const { bigBalance: bigBaseAssetBalanceWallet } =
        await getBigWalletBalance(baseAsset, library);
      const optionPosition = ethers.constants.Zero;
      setBalances({
        shrub: {
          quoteAsset: bigQuoteAssetBalanceShrub,
          baseAsset: bigBaseAssetBalanceShrub,
        },
        wallet: {
          baseAsset: bigBaseAssetBalanceWallet,
          quoteAsset: bigQuoteAssetBalanceWallet,
        },
        optionPosition,
      });
    }
    main().catch(console.error);
  }, [active, account, pendingTxsState]);

  const step1complete = !!account;
  const step2complete =
    balances &&
    balances.shrub &&
    balances.wallet &&
    (!balances.shrub.baseAsset.eq(Zero) || !balances.wallet.baseAsset.eq(Zero));
  const step3complete =
    balances && balances.shrub && !balances.shrub.baseAsset.eq(Zero);

  const alertColor = useColorModeValue("gray.100", "dark.300");
  const [withdrawDepositAction, setWithdrawDepositAction] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [walletTokenBalance, setWalletTokenBalance] = useState("");
  const [approving, setApproving] = useState(false);
  const [activeHash, setActiveHash] = useState<string>();
  const [shrubBalance, setShrubBalance] = useState({
    locked: { MATIC: 0, SMATIC: 0, SUSD: 0 },
    available: { MATIC: 0, SMATIC: 0, SUSD: 0 },
  } as ShrubBalance);
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();
  const [amountValue, setAmountValue] = useState("0");
  const [modalCurrency, setModalCurrency] =
    useState<SupportedCurrencies>("SUSD");
  // radio buttons
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "currency",
    defaultValue: modalCurrency,
    onChange: (value: SupportedCurrencies) => setModalCurrency(value),
  });
  const [showDepositButton, setShowDepositButton] = useState(false);
  const btnBg = useColorModeValue("sprout", "teal");

  const connectWalletTimeout = useRef<NodeJS.Timeout>();

  // shrub balance display
  useEffect(() => {
    setLocalError("");
    async function shrubBalanceHandler() {
      await setTimeout(() => Promise.resolve(), 50);
      if (!active || !account) {
        connectWalletTimeout.current = setTimeout(() => {
          handleErrorMessages({ customMessage: "Please connect your wallet" });
          console.error("Please connect wallet");
        }, 500);
        return;
      }
      if (connectWalletTimeout.current) {
        clearTimeout(connectWalletTimeout.current);
      }

      const shrubBalanceObj: ShrubBalance = { locked: {}, available: {} };
      for (const currencyObj of Object.values(Currencies)) {
        const { symbol, address: tokenContractAddress } = currencyObj;
        const bigBalance = await getAvailableBalance({
          address: account,
          tokenContractAddress,
          provider: library,
        });
        const bigLockedBalance = await getLockedBalance(
          account,
          tokenContractAddress,
          library
        );
        const balance = ethers.utils.formatUnits(bigBalance, 18);
        const lockedBalance = ethers.utils.formatUnits(bigLockedBalance, 18);
        shrubBalanceObj.available[symbol] = Number(balance);
        shrubBalanceObj.locked[symbol] = Number(lockedBalance);
      }
      setShrubBalance(shrubBalanceObj);
    }
    shrubBalanceHandler().catch(console.error);
  }, [active, account, library, pendingTxsState]);

  // determine if approved
  useEffect(() => {
    console.log("running setIsApproved");
    if (!library) {
      return;
    }
    async function handleApprove() {
      await setTimeout(() => Promise.resolve(), 50);
      setWalletTokenBalance("-");
      if (modalCurrency !== "MATIC") {
        try {
          const allowance = await getAllowance(
            Currencies[modalCurrency].address,
            library
          );
          console.log(allowance);
          if (allowance.gt(ethers.BigNumber.from(0))) {
            setIsApproved(true);
          } else {
            setIsApproved(false);
          }
        } catch (e: any) {
          handleErrorMessages(e);
          console.error(e);
        }
        try {
          const balance = await getWalletBalance(
            Currencies[modalCurrency].address,
            library
          );
          setWalletTokenBalance(balance);
        } catch (e: any) {
          handleErrorMessages(e);
          console.error(e);
        }
      }
    }
    handleApprove();
  }, [modalCurrency, account, pendingTxsState, active]);

  function handleWithdrawDepositModalClose() {
    setApproving(false);
    setActiveHash(undefined);
    onCloseModal();
  }

  function goToDeposit() {
    onCloseModal();
    setApproving(false);
    setActiveHash(undefined);
    onOpenModal();
    setLocalError("");
    // setAmountValue('');
    setModalCurrency(modalCurrency);
  }

  function handleWithdrawDepositModalOpen(buttonText?: any) {
    return async function handleClick() {
      onOpenModal();
      setWithdrawDepositAction(buttonText);
      setLocalError("");
      // setAmountValue('');
      setModalCurrency(modalCurrency);
    };
  }

  // inside withdraw deposit modal
  async function handleDepositWithdraw(event: any, approve?: string) {
    try {
      if (!active || !account) {
        handleErrorMessages({ customMessage: "Please connect your wallet" });
        return;
      }
      setApproving(true);
      let tx;
      if (approve === "approve") {
        setShowDepositButton(true);
        tx = await approveToken(
          Currencies[modalCurrency].address,
          ethers.utils.parseUnits(amountValue || "0"),
          library
        );
      } else if (withdrawDepositAction === "Deposit") {
        setShowDepositButton(false);
        if (modalCurrency === "MATIC") {
          tx = await depositEth(ethers.utils.parseUnits(amountValue), library);
        } else {
          // Deposit SUSD
          tx = await depositToken(
            Currencies[modalCurrency].address,
            ethers.utils.parseUnits(amountValue),
            library
          );
        }
      } else {
        setShowDepositButton(false);
        // Withdraw
        tx = await withdraw(
          Currencies[modalCurrency].address,
          ethers.utils.parseUnits(amountValue),
          library
        );
      }
      setApproving(false);
      const description =
        approve === "approve"
          ? "Approving SUSD"
          : `${withdrawDepositAction} ${amountValue} ${modalCurrency}`;
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      setActiveHash(tx.hash);
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
        pendingTxsDispatch({
          type: "update",
          txHash: e.transactionHash || e.hash,
          status: "failed",
        });
        toast({
          title: "Transaction Failed",
          description: toastDescription,
          status: "error",
          isClosable: true,
          variant: "solid",
          position: "top-right",
        });
      }
    } catch (e: any) {
      setApproving(false);
      setShowDepositButton(false);
      handleErrorMessages({ err: e });
    }
  }
  async function fillSendMax() {
    if (withdrawDepositAction === "Deposit") {
      const walletBalanceValue = await getWalletBalance(
        Currencies[modalCurrency].address,
        library
      );
      setAmountValue(walletBalanceValue);
    } else if (withdrawDepositAction === "Withdraw") {
      setAmountValue(String(shrubBalance.available[modalCurrency]));
    }
  }

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.lg"
      >
        <Center mt={10}>
          <Box maxW="60rem" mb={8} textAlign={"center"}>
            <Heading
              fontSize={{ base: "30px", md: "50px" }}
              letterSpacing={"tight"}
            >
              Paper Gardens
            </Heading>
            {!isMobile && (
              <>
                <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                  <Text
                    fontSize={{ base: "20px", md: "30px" }}
                    fontWeight="semibold"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    CHAPTER 2: THE SAD SEEDS
                  </Text>
                </Box>
                <Box maxW="60rem" mb={8} textAlign={"justify"}>
                  <Text
                    pt="8"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    After the Paper Merchant set up his stall all of the seeds
                    were giddy with anticipation. "I wonder what my gardener is
                    like" exclaimed one seed of wonder. "I can't wait to meet my
                    gardener", said a seed of passion. "This is a great day!",
                    said a seed of power.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    The stall opened, and gardeners lined up, each claiming
                    their seeds. Every time a gardener and seed matched, the
                    seed beamed with happiness, excited to begin its journey
                    with its chosen gardener.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    However, as the days went by, and the line of gardeners went
                    away, some of the seeds began to worry. "I hope my gardener
                    didn't forget about me", said a seed of hope.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    Every day, only a few gardeners came to unite with their
                    seeds. Those lucky chosen seeds were happy, but the rest
                    began to realize the cold truth that they might not be
                    united with their gardener at all.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    Finally the moment came, it was time for the Paper Merchant
                    to go, and the remaining seeds gasped as they realized their
                    fate: they would remain without a gardener.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    One of the Seeds of Passion shrieked "What will we do???"
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    The Paper Merchant, who had been silent all this while, got
                    up and spoke calmly.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "The gardeners that you all chose did not make it."
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "How will we ever grow? Is this the end for us?" asked a
                    seed of Wonder.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "It will not be easy", responded the Paper Merchant, "and
                    true happiness will be a challenge to find, but there is
                    still a way for you".
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "I will search for foster gardeners. Those who are willing
                    to take care for the unchosen. If you are united with the
                    right one, you too can thrive".
                  </Text>
                  <Text
                    pt="6"
                    mb="14"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    Who are the gardeners willing to care for sad seeds and how
                    will the Paper Merchant find them. It will all become clear
                    in the days to come.
                  </Text>
                </Box>
                <Button
                  size="sm"
                  px="30"
                  fontSize="25px"
                  py="8"
                  colorScheme={tradingBtnColor}
                  variant="solid"
                  rounded="3xl"
                  _hover={{ transform: "translateY(-2px)" }}
                  bgGradient="linear(to-r, #74cecc, green.300, #e3d606)"
                  as={ReachLink}
                  to={"/adoptions"}
                >
                  Adopt a Seed
                </Button>
                <Box maxW="60rem" mb={4} textAlign={"center"} mt={20}>
                  <Text
                    fontSize="30px"
                    fontWeight="semibold"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    CHAPTER 1: THE TRAVELLING MERCHANT
                  </Text>
                </Box>
                <Box maxW="60rem" mb={8} textAlign={"justify"}>
                  <Text
                    pt="8"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    There was something different in the air on the day when he
                    appeared, something mysterious and filled with possibility.
                    He came in on foot, towing along his cart.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    A tall man with dark worn clothes. His face wore the signs
                    of his journeys and his eyes were full of wisdom. Outsiders
                    didn't normally visit the town. The residents took notice.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "What do they call you?" one resident asked.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "I am the Paper Merchant", replied the man.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "I have come bearing paper seeds. Some of you have been
                    chosen by the seeds. If you ask, I will give you yours."
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "I have four varieties of seeds in my wares:
                    <UnorderedList>
                      <ListItem>
                        SEEDS OF WONDER - excited for the world, these are the
                        most plentiful.
                      </ListItem>
                      <ListItem>
                        SEEDS OF PASSION - filled with love, these are uncommon.
                      </ListItem>
                      <ListItem>
                        SEEDS OF HOPE - with visions of future greatness, these
                        are rare.
                      </ListItem>
                      <ListItem>
                        SEEDS OF POWER - legendary, with an aura that makes
                        others gravitate to them."
                      </ListItem>
                    </UnorderedList>
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "I am only here for sometime. If a seed is calling, you must
                    visit me by then, or it will go to another."
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    The paper merchant setup his stall in the corner of town.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    "If you have been chosen, come forth", he said.
                  </Text>
                  <Text
                    pt="6"
                    mb="8"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    But what do these seeds do? And what is a seed without soil?
                  </Text>
                  <Text
                    pt="6"
                    mb="14"
                    fontSize="20px"
                    fontWeight={"medium"}
                    color={useColorModeValue("gray.600", "gray.300")}
                  >
                    Read Chapter 2.
                  </Text>
                </Box>
                <Link
                  href="https://opensea.io/collection/shrub-paper-gardens"
                  isExternal
                  cursor="pointer"
                  rounded="3xl"
                  size="sm"
                  px="6"
                  fontSize="25px"
                  fontWeight="semibold"
                  py="5"
                  _hover={{ transform: "translateY(-2px)" }}
                  bgGradient="linear(to-r, #74cecc, green.300, #e3d606)"
                  color={useColorModeValue("white", "black")}
                >
                  View Collection <ExternalLinkIcon mx="2px" />
                </Link>
              </>
            )}
          </Box>
        </Center>
      </Container>
    </>
  );
}

export default HomeView;
