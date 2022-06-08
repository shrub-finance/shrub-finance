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
  mint,
  balanceOfErc1155,
  approveAllErc721,
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

function sIfMany(n: ethers.BigNumberish) {
  const bigN = ethers.BigNumber.from(n);
  return bigN.eq(1) ? "" : "s";
}

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
  const [accountTicketCount, setAccountTicketCount] = useState(Zero);
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

  async function handleBlockchainTx(
    description: string,
    callbackTx: () => Promise<ethers.ContractTransaction>
  ) {
    setLocalError("");
    setIsMinted(false);
    setNftImageId("");
    setTokenId(0);
    setNftTitle("");
    setIsLoading(true);
    try {
      if (!mintPrice) {
        throw new Error("mintPrice not found");
      }
      const tx = await callbackTx();
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      setActiveHash(tx.hash);
      try {
        const receipt = await tx.wait();
        setIsLoading(false);
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
        setIsLoading(false);
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
      setIsLoading(false);
      handleErrorMessages({ err: e });
    }
  }

  function handleApprove() {
    return handleBlockchainTx("Approving WETH", () => {
      return approveToken(
        WETHAddress,
        ethers.BigNumber.from(amountValue).mul(mintPrice || 0),
        NFT_TICKET_ADDRESS,
        library
      );
    });
  }

  async function handleMintNFT() {
    return handleBlockchainTx("NFT Ticket Minted Successful!", () =>
      mint(NFT_TICKET_TOKEN_ID, amountValue, library)
    );
  }

  async function handleMintWlNFT() {
    return handleBlockchainTx("NFT Ticket Minted Successful!", () =>
      mintWL(NFT_TICKET_TOKEN_ID, amountValue, library)
    );
  }

  // async function handleApprove() {
  //   setLocalError("");
  //   const description = "Approving WETH";
  //   try {
  //     if (!mintPrice) {
  //       throw new Error("mintPrice not found");
  //     }
  //     const tx = await approveToken(
  //       WETHAddress,
  //       ethers.BigNumber.from(amountValue).mul(mintPrice),
  //       NFT_TICKET_ADDRESS,
  //       library
  //     );
  //     pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
  //     setActiveHash(tx.hash);
  //     try {
  //       const receipt = await tx.wait();
  //       const toastDescription = ToastDescription(
  //         description,
  //         receipt.transactionHash,
  //         chainId
  //       );
  //       toast({
  //         title: "Transaction Confirmed",
  //         description: toastDescription,
  //         status: "success",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: receipt.transactionHash,
  //         status: "confirmed",
  //       });
  //     } catch (e: any) {
  //       const toastDescription = ToastDescription(
  //         description,
  //         e.transactionHash,
  //         chainId
  //       );
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: e.transactionHash || e.hash,
  //         status: "failed",
  //       });
  //       toast({
  //         title: "Transaction Failed",
  //         description: toastDescription,
  //         status: "error",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //     }
  //   } catch (e: any) {
  //     setApproving(false);
  //     handleErrorMessages({ err: e });
  //   }
  // }

  // async function handleMintNFT() {
  //   setLocalError("");
  //   setIsMinted(false);
  //   setNftImageId("");
  //   setTokenId(0);
  //   setNftTitle("");
  //   setIsLoading(true);
  //   const description = "NFT Ticket Minted Successful!";
  //   try {
  //     if (!mintPrice) {
  //       throw new Error("mintPrice not found");
  //     }
  //     console.log(NFT_TICKET_TOKEN_ID);
  //     const tx =
  //       phase === "wlMint"
  //         ? await mintWL(NFT_TICKET_TOKEN_ID, amountValue, library)
  //         : await mint(NFT_TICKET_TOKEN_ID, amountValue, library);
  //     pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
  //     setActiveHash(tx.hash);
  //     try {
  //       const receipt = await tx.wait();
  //       setIsLoading(false);
  //       setIsMinted(true);
  //       const toastDescription = ToastDescription(
  //         description,
  //         receipt.transactionHash,
  //         chainId
  //       );
  //       toast({
  //         title: "Transaction Confirmed",
  //         description: toastDescription,
  //         status: "success",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: receipt.transactionHash,
  //         status: "confirmed",
  //       });
  //     } catch (e: any) {
  //       setIsLoading(false);
  //       const toastDescription = ToastDescription(
  //         description,
  //         e.transactionHash,
  //         chainId
  //       );
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: e.transactionHash || e.hash,
  //         status: "failed",
  //       });
  //       toast({
  //         title: "Transaction Failed",
  //         description: toastDescription,
  //         status: "error",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //     }
  //   } catch (e: any) {
  //     setApproving(false);
  //     setIsLoading(false);
  //     handleErrorMessages({ err: e });
  //   }
  // }

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
    console.log(phase);
    const timerD =
      phase === "before"
        ? fromEthDate(wlMintStartDate)
        : phase === "wlMint"
        ? fromEthDate(wlMintEndDate)
        : phase === "break"
        ? fromEthDate(mintStartDate)
        : phase === "mint"
        ? fromEthDate(mintEndDate)
        : undefined;
    setTimerDate(timerD);
    console.log(toEthDate(timerD || new Date()));
  }, [ticketData]);

  // useEffect for account
  useEffect(() => {
    console.log(ticketData);
    if (!library || !account || !ticketData || !phase) {
      return;
    }
    console.log("running useEffect-account");

    async function accountAsync() {
      if (!account) {
        return;
      }
      // Check if account has tickets
      console.log("checking ticket count");
      try {
        const ticketCount = await balanceOfErc1155(
          NFT_TICKET_ADDRESS,
          NFT_TICKET_TOKEN_ID,
          library
        );
        setAccountTicketCount(ticketCount);
      } catch (e) {
        console.error(e);
        // Continue along if this fails - it does not affect the rest of the chain
      }

      // Check if account has whitelists
      if (phase === "wlMint") {
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
      }

      // Check the minting price
      console.log("checking mint price");
      try {
        console.log(phase);
        setMintPrice(
          phase === "wlMint" ? ticketData.wlMintPrice : ticketData.mintPrice
        );
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
        setWalletTokenBalance(bigBalance);
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
  }, [account, phase, ticketData, pendingTxsState]);

  const noWlSpots =
    phase === "wlMint" &&
    ethers.BigNumber.from(amountValue || 0).gt(accountWlSlots);
  const tooLarge =
    phase === "mint" &&
    ticketData &&
    ethers.BigNumber.from(amountValue || 0).gt(
      ticketData.maxMintAmountPlusOne - 1
    );
  const noFunds =
    walletTokenBalance &&
    mintPrice &&
    walletTokenBalance.lt(mintPrice.mul(amountValue || 0));
  const noAllowance =
    mintPrice && wethAllowance.lt(mintPrice.mul(amountValue || 0));

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.sm"
      >
        {isMinted && <Confetti />}
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
              Presale
            </Heading>
            <Center mt={{ base: 5, md: 10 }}>
              <Box
                bgColor={useColorModeValue("gray.200", "gray.700")}
                p={10}
                rounded="3xl"
              >
                <Box
                  fontSize={{ base: "18px", md: "20px" }}
                  mt={4}
                  fontWeight="semibold"
                >
                  <Text
                    fontSize="md"
                    color={useColorModeValue("gray.600", "gray.400")}
                  >
                    Tickets can be redeemed for a pot after the public sale
                  </Text>
                  <Text>Redemption price: 0.015 ETH</Text>
                  <Text>Redeeming opens: June 16</Text>
                  <Text>Deadline to redeem: June 23</Text>
                </Box>
                <Box
                  fontSize={{ base: "18px", md: "20px" }}
                  mt={8}
                  fontWeight="semibold"
                >
                  <Text
                    fontSize="md"
                    color={useColorModeValue("gray.600", "gray.400")}
                  >
                    If not redeemed by the deadline{" "}
                    <strong>ticket will expire</strong>
                  </Text>
                  <Text>Expires: After June 23 </Text>
                </Box>
                <Box
                  fontSize={{ base: "18px", md: "20px" }}
                  mt={8}
                  fontWeight="semibold"
                >
                  <Text
                    fontSize="md"
                    color={useColorModeValue("gray.600", "gray.400")}
                  >
                    Mint Info:
                  </Text>
                  <Text>
                    You currently have {accountTicketCount.toString()} ticket
                    {sIfMany(accountTicketCount)}
                  </Text>
                  {["before", "wlMint"].includes(phase || "") && (
                    <Text>
                      You are eligible to mint {accountWlSlots.toNumber()}{" "}
                      ticket
                      {sIfMany(accountWlSlots)}
                    </Text>
                  )}
                  {["before", "wlMint"].includes(phase || "") && (
                    <Text>
                      Mint price per ticket:{" "}
                      {ticketData
                        ? ethers.utils.formatEther(ticketData.wlMintPrice)
                        : "-"}{" "}
                      WETH (WL discount presale)
                    </Text>
                  )}
                  {["before", "break", "mint", "done"].includes(
                    phase || ""
                  ) && (
                    <Text>
                      Mint price per ticket:{" "}
                      {ticketData
                        ? ethers.utils.formatEther(ticketData.mintPrice)
                        : "-"}{" "}
                      WETH (public presale)
                    </Text>
                  )}
                </Box>
              </Box>
            </Center>

            {/*Input boxes*/}
            {["wlMint", "mint"].includes(phase || "") && (
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
                    min={0}
                    max={10}
                    precision={0}
                    onChange={(valueString) => {
                      const [integerPart, decimalPart] = valueString.split(".");
                      if (valueString.includes(".")) {
                        setAmountValue(integerPart || "0");
                        return;
                      }
                      if (integerPart && integerPart.length > 2) {
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
            )}
            {["wlMint", "mint"].includes(phase || "") && (
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
            {["wlMint", "mint"].includes(phase || "") && (
              <Center>
                {
                  <Button
                    onClick={
                      noAllowance
                        ? handleApprove
                        : phase === "wlMint"
                        ? handleMintWlNFT
                        : handleMintNFT
                    }
                    colorScheme={tradingBtnColor}
                    variant="solid"
                    rounded="2xl"
                    isLoading={isLoading}
                    isDisabled={
                      Number(amountValue) <= 0 || noWlSpots || noFunds
                    }
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
                        : tooLarge
                        ? `Quantity above allowed (max ${(
                            ticketData.maxMintAmountPlusOne - 1
                          ).toString()})`
                        : noFunds
                        ? "Insufficient funds"
                        : noAllowance
                        ? "Approve WETH"
                        : "Mint Ticket"
                    }
                  </Button>
                }
              </Center>
            )}
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
      <Box fontWeight="medium" fontSize={"xs"}>
        <Text>NFT Ticket Address: {NFT_TICKET_ADDRESS}</Text>
        <Text>
          Paper Gardens Pot Address: {ticketData && ticketData.contractAddress}
        </Text>
        <Text>WETH Address: {WETHAddress}</Text>
      </Box>

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
