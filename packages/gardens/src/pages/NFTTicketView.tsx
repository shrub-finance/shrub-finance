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
  claimNFT,
  getChecksumAddress,
  getTokenUri,
  getWLMintPrice,
  getWalletBalance,
} from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";
import axios from "axios";
const PAPERSEED_CONTRACT_ADDRESS =
  process.env.REACT_APP_PAPERSEED_ADDRESS || "";
const NFT_TICKET_TOKEN_ID = process.env.REACT_APP_TICKET_TOKEN_ID || "";

import { FaTwitter } from "react-icons/all";
import { OpenSeaIcon } from "../assets/Icons";
import { ethers } from "ethers";

function NFTTicketView(props: RouteComponentProps) {
  const WETHAddress = process.env.REACT_APP_WETH_TOKEN_ADDRESS || "";
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
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
  const [walletTokenBalance, setWalletTokenBalance] = useState("");
  const [approving, setApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  const nftImageLink = `https://ipfs.io/ipfs/${nftImageId}`;
  const openSeaLink = `https://opensea.io/assets/matic/${PAPERSEED_CONTRACT_ADDRESS}/${tokenId}`;

  async function handleMintNFT() {
    setLocalError("");
    setIsMinted(false);
    setNftImageId("");
    setTokenId(0);
    setNftTitle("");
    setIsLoading(true);

    try {
      if (!account) {
        setIsLoading(false);
        if (
          !!web3Error &&
          getErrorMessage(web3Error).title === "Wrong Network"
        ) {
          return addNetwork();
        } else {
          return onConnectWalletOpen();
        }
      }
      if (account) {
        try {
          const whitelists = await accountWL(
            ethers.BigNumber.from(NFT_TICKET_TOKEN_ID),
            account,
            library
          );

          // if (whitelists) {
          // } else {
          // }
        } catch (e: any) {
          setIsLoading(false);
          handleErrorMessages({ err: e });
        }
        return addNetwork();
      }
    } catch (e: any) {
      handleErrorMessages({ err: e });
      console.error(e);
    }
  }

  // determine if approved
  useEffect(() => {
    if (!library) {
      return;
    }
    async function handleApprove() {
      await setTimeout(() => Promise.resolve(), 50);
      setWalletTokenBalance("-");

      try {
        const allowance = await getWLMintPrice(
          ethers.BigNumber.from(NFT_TICKET_TOKEN_ID),
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
        const balance = await getWalletBalance(account, library);
        setWalletTokenBalance(balance);
      } catch (e: any) {
        handleErrorMessages(e);
        console.error(e);
      }
    }

    handleApprove();
  }, [account]);

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
                  onClick={handleMintNFT}
                  colorScheme={tradingBtnColor}
                  variant="solid"
                  rounded="2xl"
                  isLoading={isLoading}
                  size="lg"
                  px={["50", "70", "90", "90"]}
                  fontSize="25px"
                  py={10}
                  borderRadius="full"
                  _hover={{ transform: "translateY(-2px)" }}
                  bgGradient={"linear(to-r,#74cecc,green.300,blue.400)"}
                  loadingText="Minting..."
                >
                  {account
                    ? "Mint Ticket"
                    : !!web3Error &&
                      getErrorMessage(web3Error).title === "Wrong Network"
                    ? "Connect to Polygon"
                    : "Connect Wallet"}
                </Button>
              )}
            </Center>
          </Box>
        </Center>
      </Container>

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
