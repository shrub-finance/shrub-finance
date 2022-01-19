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
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import { Image } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
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
import { claimNFT, getChecksumAddress, getTokenUri } from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";
import axios from "axios";
const PAPERSEED_CONTRACT_ADDRESS =
  process.env.REACT_APP_PAPERSEED_ADDRESS || "";
import { FaTwitter } from "react-icons/all";
import { OpenSeaIcon } from "../assets/Icons";

function PaperView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const toast = useToast();
  const tradingBtnColor = useColorModeValue("sprout", "teal");
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

  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  const nftImageLink = `https://ipfs.io/ipfs/${nftImageId}`;
  const openSeaLink = `https://opensea.io/assets/matic/${PAPERSEED_CONTRACT_ADDRESS}/${tokenId}`;

  async function handleClaimNFT() {
    setLocalError("");
    setIsClaimed(false);
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
        const checksumAccount = getChecksumAddress(account);
        try {
          const whitelisted = await axios.get(
            `https://merkle.vercel.app/merkle/${checksumAccount}`
          );
          // @ts-ignore
          if (whitelisted) {
            // @ts-ignore
            const eligibleAccount = whitelisted.data;
            const eligibleAccountIndex = eligibleAccount.index;
            const eligibleAccountID = parseInt(eligibleAccount.amount, 16);
            const eligibleAccountProof = eligibleAccount.proof;

            const tx = await claimNFT(
              eligibleAccountIndex,
              eligibleAccountID,
              eligibleAccountProof,
              library
            );
            const description = `You just got a Paper Seed!`;
            pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
            setActiveHash(tx.hash);
            try {
              const receipt = await tx.wait();
              if (receipt.status === 1) {
                setIsClaimed(true);
              }
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
              let uri = await getTokenUri(eligibleAccountID, library);
              setTokenId(eligibleAccountID);

              let nfti = "";
              let metadataName = "";
              if (uri && uri.includes("://")) {
                uri = `https://ipfs.io/ipfs/${uri.split("://")[1]}`;
                const nftMetadata = await axios.get(uri);
                if (
                  nftMetadata.data.image &&
                  nftMetadata.data.image.includes("://")
                ) {
                  nfti = nftMetadata.data.image.split("://")[1];
                  metadataName = nftMetadata.data.name;
                }
              }
              setNftImageId(nfti);
              setNftTitle(metadataName);
            } catch (e: any) {
              setIsLoading(false);
              handleErrorMessages({ err: e });
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
          } else {
            setLocalError("This address is not on the Shrub NFT whitelist.");
          }
        } catch (e: any) {
          setIsLoading(false);
          if (e.response && e.response.data) {
            handleErrorMessages({ customMessage: e.response.data });
          } else {
            handleErrorMessages({ err: e });
          }
        }
        return addNetwork();
      }
    } catch (e: any) {
      handleErrorMessages({ err: e });
      console.error(e);
    }
  }

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.sm"
      >
        {isClaimed && activeHash && <Confetti />}
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
              maxW="60rem"
              fontSize={["5xl", "6xl", "90px", "90px"]}
              fontWeight="medium"
              textAlign="center"
            >
              <Text
                as="span"
                bgGradient="linear(to-l, #e3d606, #54885d, #b1e7a1, #a1beaf, #cd5959)"
                bgClip="text"
                boxDecorationBreak="clone"
              >
                {!isClaimed ? "Paper Gardens" : "Congrats!"}
              </Text>
            </Heading>
            {!isClaimed && !activeHash && (
              <Text
                mt="3"
                mb={{ base: "16px", md: "10", lg: "10" }}
                color={useColorModeValue("gray.700", "gray.300")}
                fontSize="18px"
                textAlign="center"
                fontWeight="medium"
                bgGradient="linear(to-r, #bd2bdd, #bfd71c, #c94b09)"
                bgClip="text"
              >
                {isMobile
                  ? "Time to claim your seed!"
                  : "Time to claim your seed. Let's go!"}
              </Text>
            )}
            {isClaimed && (
              <Text
                mt="3"
                color={useColorModeValue("gray.700", "gray.300")}
                fontSize="18px"
                textAlign="center"
                fontWeight="medium"
                bgGradient="linear(to-r, #bd2bdd, #bfd71c, #c94b09)"
                bgClip="text"
              >
                A seed has chosen you
              </Text>
            )}
            <Center>
              {!isClaimed && !activeHash && (
                <Button
                  onClick={handleClaimNFT}
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
                  loadingText="Claiming..."
                >
                  {account
                    ? "Claim your Seed"
                    : !!web3Error &&
                      getErrorMessage(web3Error).title === "Wrong Network"
                    ? "Connect to Polygon"
                    : "Connect Wallet"}
                </Button>
              )}
            </Center>
            {!isClaimed && !activeHash && (
              <Center>
                <Link
                  mt="8"
                  mb={{ base: "16px", md: "10", lg: "10" }}
                  color={useColorModeValue("gray.700", "gray.300")}
                  fontSize="18px"
                  textAlign="center"
                  fontWeight="medium"
                  bgGradient="linear(to-r, #bd2bdd, #bfd71c, #c94b09)"
                  bgClip="text"
                  href="https://opensea.io/collection/shrub-paper-gardens"
                >
                  Don't have a seed? Buy one
                </Link>
              </Center>
            )}
          </Box>
        </Center>
      </Container>

      {isClaimed && nftImageId && (
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
                )}%23NFT%20I%20minted%20via%20%40shrubfinance%20%400xPolygon.%20Isn%27t%20he%20adorable%3F%0Ahttps%3A//opensea.io/assets/matic/${PAPERSEED_CONTRACT_ADDRESS}/${tokenId}/`}
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

export default PaperView;
