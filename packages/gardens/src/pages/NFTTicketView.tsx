import {
  Box,
  Heading,
  Text,
  Button,
  Center,
  useColorModeValue,
  Container,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  toast,
  useToast,
  SlideFade,
  Alert,
  AlertIcon,
  Link,
  Icon,
  Spacer,
  Flex,
  useColorMode,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import { Image } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import useAddNetwork from "../hooks/useAddNetwork";
import { isMobile } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import {
  ToastDescription,
  Txmonitor,
  TxStatusList,
} from "../components/TxMonitoring";
import {
  accountWL,
  getWLMintPrice,
  getBigWalletBalance,
  getAllowance,
  approveToken,
  mintWL,
  getTicketData,
  toEthDate,
  fromEthDate,
} from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";
const PAPERSEED_CONTRACT_ADDRESS =
  process.env.REACT_APP_PAPERSEED_ADDRESS || "";
const NFT_TICKET_TOKEN_ID = process.env.REACT_APP_TICKET_TOKEN_ID || "";
const NFT_TICKET_ADDRESS = process.env.REACT_APP_NFT_TICKET_ADDRESS || "";

import { BsArrowDownShort, FaTwitter } from "react-icons/all";
import { OpenSeaIcon, PolygonIcon } from "../assets/Icons";
import { BigNumber, ethers } from "ethers";
import CountdownTimer from "../components/CountdownTimer";

type Phase = "before" | "wlMint" | "break" | "mint" | "done";

// Should show
// TODO: How many tickets account owns (You have 2 tickets)
// TODO: The contract addresses of WETH, NFTTicket, Pot
// TODO: A timer for how long is left in the sale

// Need to add
// TODO: Should get the sale dates from the ticket and update state automatically based on them.

function NFTTicketView(props: RouteComponentProps) {
  const { Zero } = ethers.constants;
  const WETHAddress = process.env.REACT_APP_WETH_TOKEN_ADDRESS || "";
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [wethAllowance, setWethAllowance] = useState(Zero);
  const [ticketData, setTicketData] = useState<any>();
  const [phase, setPhase] = useState<Phase>();
  const [timerDate, setTimerDate] = useState<Date>();
  const [mintPrice, setMintPrice] = useState<BigNumber>();
  const [accountWlSlots, setAccountWlSlots] = useState(Zero);
  const toast = useToast();
  const tradingBtnColor = useColorModeValue("sprout", "teal");
  const { colorMode } = useColorMode();
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const addNetwork = useAddNetwork();
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };
  const [isHidden, setIsHidden] = useState(false);
  const [nftImageId, setNftImageId] = useState("");
  const [nftTitle, setNftTitle] = useState("");
  const [tokenId, setTokenId] = useState(0);
  const [walletTokenBalance, setWalletTokenBalance] = useState<BigNumber>();
  const [approving, setApproving] = useState(false);

  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  const nftImageLink = `https://ipfs.io/ipfs/${nftImageId}`;
  const openSeaLink = `https://opensea.io/assets/matic/${PAPERSEED_CONTRACT_ADDRESS}/${tokenId}`;

  const bgColor = useColorModeValue("gray.100", "blackAlpha.400");
  const format = (val: string) => val;
  const [amountValue, setAmountValue] = useState("1");
  const invalidEntry = Number(amountValue) < 0 || isNaN(Number(amountValue));

  async function handleApprove() {
    const description = "Approving WETH";
    try {
      if (!mintPrice) {
        throw new Error("mintPrice not found");
      }
      const tx = await approveToken(
        WETHAddress,
        ethers.BigNumber.from(amountValue).mul(mintPrice),
        NFT_TICKET_ADDRESS,
        library
      );
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
      handleErrorMessages({ err: e });
    }
  }

  async function handleMintNFT() {
    setLocalError("");
    setIsMinted(false);
    setNftImageId("");
    setTokenId(0);
    setNftTitle("");
    setIsLoading(true);
    const description = "Mint NFT Tickets";
    try {
      if (!mintPrice) {
        throw new Error("mintPrice not found");
      }
      console.log(NFT_TICKET_TOKEN_ID);
      const tx = await mintWL(NFT_TICKET_TOKEN_ID, amountValue, library);
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      setActiveHash(tx.hash);
      try {
        const receipt = await tx.wait();
        setIsMinted(true);
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
      handleErrorMessages({ err: e });
    }
  }

  // run on init
  useEffect(() => {
    if (!library) {
      return;
    }
    async function init() {
      console.log("getting ticketData");
      const td = await getTicketData(NFT_TICKET_TOKEN_ID, library);
      const {
        contractAddress,
        startDate,
        endDate,
        mintStartDate,
        mintEndDate,
        mintPrice,
        wlMintStartDate,
        wlMintEndDate,
        wlMintPrice,
        maxMintAmountPlusOne,
        redeemPrice,
        maxSupply,
        active,
        paused,
      } = td;
      setTicketData({
        contractAddress,
        startDate,
        endDate,
        mintStartDate,
        mintEndDate,
        mintPrice,
        wlMintStartDate,
        wlMintEndDate,
        wlMintPrice,
        maxMintAmountPlusOne,
        redeemPrice,
        maxSupply,
        active,
        paused,
      });
      console.log(td);
    }
    init().catch((err) => console.error(err));
  }, [library]);

  // useEffect to set the phase
  useEffect(() => {
    if (!ticketData) {
      return;
    }
    const { mintStartDate, mintEndDate, wlMintStartDate, wlMintEndDate } =
      ticketData;
    const now = toEthDate(new Date());
    const phase =
      now < wlMintStartDate
        ? "before"
        : now < wlMintEndDate
        ? "wlMint"
        : now < mintStartDate
        ? "break"
        : now < mintEndDate
        ? "mint"
        : "done";
    setPhase(phase);
    setTimerDate(
      phase === "before"
        ? fromEthDate(wlMintStartDate)
        : phase === "wlMint"
        ? fromEthDate(wlMintEndDate)
        : phase === "break"
        ? fromEthDate(mintStartDate)
        : phase === "mint"
        ? fromEthDate(mintEndDate)
        : undefined
    );
  }, [ticketData]);

  // useEffect for account
  useEffect(() => {
    console.log(ticketData);
    if (!library || !account || !ticketData) {
      return;
    }
    console.log("running useEffect-account");

    async function accountAsync() {
      if (!account) {
        return;
      }

      // Check if account has whitelists
      console.log("checking whitelist");
      try {
        const aWlSlots = await accountWL(
          ethers.BigNumber.from(NFT_TICKET_TOKEN_ID),
          account,
          library
        );
        console.log(aWlSlots);
        console.log(aWlSlots.toNumber());
        setAccountWlSlots(aWlSlots);
        if (aWlSlots.eq(Zero)) {
          return;
        }
      } catch (e: any) {
        setIsLoading(false);
        handleErrorMessages({ err: e });
      }

      // Check the minting price
      console.log("checking mint price");
      let wlMintPrice;
      try {
        wlMintPrice = await getWLMintPrice(
          ethers.BigNumber.from(NFT_TICKET_TOKEN_ID),
          library
        );
        setMintPrice(wlMintPrice);
        // if (allowance.gt(ethers.BigNumber.from(0))) {
        //   setIsApproved(true);
        // } else {
        //   setIsApproved(false);
        // }
      } catch (e: any) {
        handleErrorMessages(e);
        console.error(e);
        return;
      }

      // Check the wallet balance
      console.log("checking balance");
      try {
        const balanceObj = await getBigWalletBalance(WETHAddress, library);
        const { bigBalance } = balanceObj;
        // const balance = await getWalletBalance(account, library);
        setWalletTokenBalance(bigBalance);
        if (bigBalance.lt(wlMintPrice)) {
          // TODO: Show user that balance is insufficient
        }
      } catch (e: any) {
        handleErrorMessages(e);
        console.error(e);
        return;
      }

      // Check if approved for the balance amount
      console.log("checking approved");
      try {
        const allowance = await getAllowance(
          WETHAddress,
          NFT_TICKET_ADDRESS,
          library
        );
        setWethAllowance(allowance);
      } catch (e: any) {
        handleErrorMessages(e);
        console.error(e);
        return;
      }
    }

    accountAsync();
  }, [account, ticketData]);

  const noWlSpots = ethers.BigNumber.from(amountValue).gt(accountWlSlots);
  const noFunds =
    walletTokenBalance &&
    mintPrice &&
    walletTokenBalance.lt(mintPrice.mul(amountValue));
  const noAllowance = mintPrice && wethAllowance.lt(mintPrice.mul(amountValue));

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.sm"
      >
        {isMinted && activeHash && <Confetti />}
        <Center mt={10}>
          {localError && (
            <SlideFade in={true} unmountOnExit={true}>
              <Alert status="error" borderRadius={9}>
                <AlertIcon />
                {localError}
              </Alert>
            </SlideFade>
          )}
        </Center>
        <Center mt={10}>
          <Box mb={{ base: 6, md: 10 }}>
            <Heading
              textAlign={"center"}
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              bgGradient="gold.100"
              maxW={{ base: "20rem", md: "40rem" }}
            >
              NFT{" "}
              <Text
                as="span"
                background="gold.100"
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                Ticket{" "}
              </Text>
              Sale
            </Heading>
            <Text textStyle={"description"} textAlign="center">
              All tickets will be redeemable for a pot for up to a week after
              the public sale.
            </Text>
            <Text textStyle={"description"} textAlign="center">
              Redemption price for the tickets will be 0.015 ETH.{" "}
            </Text>
            <Text textStyle={"description"} textAlign="center">
              Tickets are tradble NFTs and can be sold on secondary markets.
            </Text>
            <Text textStyle={"description"} textAlign="center">
              You are eligible to mint {accountWlSlots.toNumber()} tickets.
            </Text>
            <Text textStyle={"description"} textAlign="center">
              Mint price per ticket:{" "}
              {mintPrice ? ethers.utils.formatEther(mintPrice) : "-"} WETH
            </Text>
            <VStack>
              <Box>
                <Center>
                  <FormLabel
                    fontSize={"sm"}
                    color={"gray.500"}
                    fontWeight={"medium"}
                  >
                    Quantity
                  </FormLabel>
                </Center>
                <NumberInput
                  isInvalid={invalidEntry}
                  onChange={(valueString) => {
                    const [integerPart, decimalPart] = valueString.split(".");
                    if (valueString === ".") {
                      setAmountValue("0.");
                      return;
                    }
                    if (decimalPart && decimalPart.length > 6) {
                      return;
                    }
                    if (integerPart && integerPart.length > 6) {
                      return;
                    }
                    if (valueString === "00") {
                      return;
                    }
                    if (isNaN(Number(valueString))) {
                      return;
                    }
                    if (
                      Number(valueString) !==
                      Math.round(Number(valueString) * 1e6) / 1e6
                    ) {
                      setAmountValue(Number(valueString).toFixed(6));
                      return;
                    }
                    setAmountValue(valueString);
                  }}
                  value={format(amountValue)}
                  size="lg"
                >
                  <NumberInputField
                    h="6rem"
                    borderRadius="3xl"
                    shadow="sm"
                    fontWeight="medium"
                    fontSize="2xl"
                  />
                  <InputRightElement
                    pointerEvents="none"
                    p={14}
                    children={
                      <FormLabel
                        htmlFor="amount"
                        color="gray.500"
                        fontWeight="medium"
                        minW={"100"}
                      >
                        tickets
                      </FormLabel>
                    }
                  />
                </NumberInput>
              </Box>
              <Box>
                <Center>
                  <FormLabel
                    fontSize={"sm"}
                    color={"gray.500"}
                    fontWeight={"medium"}
                  >
                    Total
                  </FormLabel>
                </Center>
                <Box
                  bg={bgColor}
                  borderRadius="3xl"
                  fontWeight="medium"
                  fontSize="2xl"
                  p={"1.813rem"}
                >
                  {invalidEntry
                    ? "?"
                    : format(
                        mintPrice
                          ? ethers.utils.formatEther(
                              mintPrice.mul(Number(amountValue))
                            )
                          : "-"
                      )}{" "}
                  WETH
                </Box>
              </Box>
            </VStack>
            {!isMinted && !activeHash && (
              <Text
                mt="3"
                mb={{ base: "16px", md: "10", lg: "10" }}
                fontSize="18px"
                textAlign="center"
                fontWeight="medium"
                background="gold.100"
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light" ? "1px #7e5807" : "transparent",
                }}
              >
                {isMobile
                  ? "Time to get your Shrub ticket!"
                  : "Time to get your Shrub ticket. Let's go!"}
              </Text>
            )}
            <Center>
              {!isMinted && !activeHash && (
                <Button
                  onClick={noAllowance ? handleApprove : handleMintNFT}
                  colorScheme={tradingBtnColor}
                  variant="solid"
                  rounded="2xl"
                  isLoading={isLoading}
                  isDisabled={Number(amountValue) <= 0 || noWlSpots || noFunds}
                  size="lg"
                  px={["50", "70", "90", "90"]}
                  fontSize="25px"
                  py={10}
                  borderRadius="full"
                  _hover={{ transform: "translateY(-2px)" }}
                  bgGradient={"linear(to-r,#74cecc,green.300,blue.400)"}
                  loadingText={noAllowance ? "Approving..." : "Minting..."}
                >
                  {
                    // If no account then Wrong Network and Connect Wallet
                    !account
                      ? !!web3Error &&
                        getErrorMessage(web3Error).title === "Wrong Network"
                        ? "Connect to Polygon"
                        : "Connect Wallet"
                      : noWlSpots
                      ? `Quantity above allowed (max ${accountWlSlots.toString()})`
                      : noFunds
                      ? "Insufficient funds"
                      : noAllowance
                      ? "Needs Approval"
                      : "Mint Ticket"
                  }
                </Button>
              )}
            </Center>
          </Box>
        </Center>
      </Container>

      {timerDate && (
        <Box maxW="60rem" mb={4} textAlign={"center"} mt={{ base: 10, md: 20 }}>
          <Text>{phase}</Text>
          <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="semibold">
            <CountdownTimer targetDate={timerDate} />
          </Text>
        </Box>
      )}

      {isMinted && nftImageId && (
        <Container
          borderRadius="2xl"
          flex="1"
          maxW="container.sm"
          bg={useColorModeValue("white", "dark.100")}
          shadow={useColorModeValue("2xl", "2xl")}
          py={10}
        >
          {nftImageId && (
            <Center>
              <Heading pb={4} fontSize={{ base: "20px", md: "30px" }}>
                {nftTitle}
              </Heading>
            </Center>
          )}

          {tokenId > 0 && (
            <Center>
              <Link href={openSeaLink} isExternal>
                <Button
                  variant="link"
                  colorScheme="blue"
                  leftIcon={<OpenSeaIcon />}
                >
                  View in Open Sea
                </Button>
              </Link>
            </Center>
          )}
          <Center py={4}>
            <Link
              href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20${nftTitle
                .replace(/w/g, "%20")
                .replace(
                  "#",
                  "%23"
                )}%20I%20minted%20via%20%40shrubfinance.%0Ahttps%3A//opensea.io/assets/matic/${PAPERSEED_CONTRACT_ADDRESS}/${tokenId}/`}
              isExternal
            >
              <Button
                variant="link"
                colorScheme="twitter"
                leftIcon={<FaTwitter />}
              >
                Share in Twitter
              </Button>
            </Link>
          </Center>
          {nftImageId && (
            <Center>
              <Image src={nftImageLink} />
            </Center>
          )}
        </Container>
      )}

      <Modal
        isOpen={isConnectWalletOpen}
        onClose={onConnectWalletClose}
        motionPreset="slideInBottom"
        scrollBehavior={isMobile ? "inside" : "outside"}
      >
        <ModalOverlay />
        <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="2xl">
          <ModalHeader>
            {!active ? (
              "Connect Wallet"
            ) : !isHidden ? (
              <Text fontSize={16}>Account Details</Text>
            ) : (
              <Button variant="ghost" onClick={() => displayStatus(false)}>
                Back
              </Button>
            )}{" "}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!active || isHidden ? (
              <ConnectWalletModal />
            ) : (
              !isHidden && <ConnectionStatus displayStatus={displayStatus} />
            )}
            {!(
              web3Error && getErrorMessage(web3Error).title === "Wrong Network"
            ) && <TxStatusList />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default NFTTicketView;
