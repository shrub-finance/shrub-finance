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
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
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
import * as whiteList from "../assets/paper-merkle.json";
import { claimNFT } from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";

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

  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  async function handleClaimNFT() {
    setLocalError("");
    setIsClaimed(false);

    if (!account) {
      if (!!web3Error && getErrorMessage(web3Error).title === "Wrong Network") {
        return addNetwork();
      } else {
        return onConnectWalletOpen();
      }
    }
    if (account) {
      try {
        // @ts-ignore
        if (whiteList.claims[account]) {
          // @ts-ignore
          const eligibleAccount = whiteList.claims[account];
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
        handleErrorMessages({ err: e });
      }
      return addNetwork();
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
          <Box mb={10}>
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
                {!isClaimed
                  ? "Shrub Paper NFT"
                  : "Congrats! You just got a Paper Seed!"}
              </Text>
            </Heading>
            {activeHash && <Txmonitor txHash={activeHash} />}
            {!isClaimed && !activeHash && (
              <Text
                mt="3"
                mb={{ base: "16px", md: "10", lg: "10" }}
                color={useColorModeValue("gray.700", "gray.300")}
                fontSize="18px"
                textAlign="center"
                fontWeight="medium"
                px={["4rem", "5rem", "17rem", "17rem"]}
                bgGradient="linear(to-r, #bd2bdd, #bfd71c, #c94b09)"
                bgClip="text"
              >
                {isMobile
                  ? "Time to mint your drop!"
                  : "Time to mint your drop. Let's go!"}
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
                >
                  {account
                    ? "Mint your NFT"
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
