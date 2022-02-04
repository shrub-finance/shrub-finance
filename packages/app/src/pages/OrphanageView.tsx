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
  useToast,
  SlideFade,
  Alert,
  AlertIcon,
  Link,
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
import { registerForAdoption } from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";
import { AdoptionImg } from "../assets/Icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FaTwitter } from "react-icons/all";

function OrphanageView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
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

  async function handleAdoptionRegistration() {
    setLocalError("");
    setIsRegistered(false);
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
          const tx = await registerForAdoption(library);
          const description = `You just registered for adopting a seed!`;
          pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
          setActiveHash(tx.hash);
          try {
            const receipt = await tx.wait();
            if (receipt.status === 1) {
              setIsRegistered(true);
            }
            const toastDescription = ToastDescription(
              description,
              receipt.transactionHash,
              chainId
            );
            toast({
              title: "You did it!",
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
              title: "Adoption Failed",
              description: toastDescription,
              status: "error",
              isClosable: true,
              variant: "solid",
              position: "top-right",
            });
          }
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

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.sm"
      >
        {isRegistered && activeHash && <Confetti />}
        <Center mt={10}>
          <Box mb={{ base: 6, md: 10 }}>
            <Heading
              maxW="60rem"
              fontSize={["5xl", "6xl"]}
              fontWeight="medium"
              textAlign="center"
            >
              {!localError.includes("'Account already registered") ? (
                <Text as="span">
                  {!isRegistered ? "Seed Adoption Program" : "You did it!"}
                </Text>
              ) : (
                <Text>You are all set</Text>
              )}
            </Heading>
            {!isRegistered &&
              !activeHash &&
              !localError.includes("'Account already registered") &&
              !localError.includes("'Account holds no seed NFTs") && (
                <Text
                  mt="3"
                  mb={{ base: "16px", md: "10", lg: "10" }}
                  color={useColorModeValue("gray.700", "gray.300")}
                  fontSize="18px"
                  textAlign="center"
                  fontWeight="medium"
                >
                  {isMobile
                    ? "Register to adopt a seed"
                    : "Register below to adopt a sad seed"}
                </Text>
              )}
            {isRegistered && (
              <Text
                mt="3"
                color={useColorModeValue("gray.700", "gray.300")}
                fontSize="18px"
                textAlign="center"
                fontWeight="medium"
              >
                Thank you being a proud sad seed adopter
              </Text>
            )}
            {isRegistered ||
              (localError.includes("'Account already registered") && (
                <Center py={4}>
                  <Link
                    href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fpaper.shrub.finance&text=I%20just%20became%20a%20proud%20seed%20adopter%20on%20@shrubfinance%21%20Join%20me%20in%20giving%20a%20seed%20a%20home%21%20&hashtags=NFTs%2CDeFi%2Cweb3"
                    isExternal
                  >
                    <Button
                      variant="link"
                      colorScheme="twitter"
                      leftIcon={<FaTwitter />}
                    >
                      Brag about it!
                    </Button>
                  </Link>
                </Center>
              ))}
            <Center position={"relative"}>
              <Center mt={10} position={"absolute"} top={0}>
                {localError && (
                  <SlideFade in={true} unmountOnExit={true}>
                    <Alert status="info" variant="shrubYellow" borderRadius={9}>
                      <AlertIcon />
                      {localError.includes("'Account holds no seed NFTs") ? (
                        <Text>
                          This address does not have any paper seeds. To adopt a
                          seed you have to first be a seed owner.{" "}
                          <Link
                            color="blue.500"
                            fontWeight={"bold"}
                            isExternal
                            href="https://opensea.io/collection/shrub-paper-gardens"
                          >
                            Become a seed owner <ExternalLinkIcon />
                          </Link>
                        </Text>
                      ) : localError.includes("'Account already registered") ? (
                        <Text>
                          This address is already registered for adoption. Thank
                          you for giving a sad seed a happy home.
                        </Text>
                      ) : (
                        localError
                      )}
                    </Alert>
                  </SlideFade>
                )}
              </Center>
              <AdoptionImg boxSize={{ base: 0, md: 1000 }} mt={-40} />
              <Center
                right={{ base: 0, md: 8 }}
                bottom={{ base: -20, md: 60 }}
                position={"absolute"}
              >
                {!isRegistered &&
                  !activeHash &&
                  !localError.includes("'Account already registered") &&
                  !localError.includes("'Account holds no seed NFTs") && (
                    <Button
                      onClick={handleAdoptionRegistration}
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
                      loadingText="Registering..."
                    >
                      {account
                        ? "Register to adopt"
                        : !!web3Error &&
                          getErrorMessage(web3Error).title === "Wrong Network"
                        ? "Connect to Polygon"
                        : "Connect Wallet"}
                    </Button>
                  )}
                {localError.includes("'Account holds no seed NFTs") && (
                  <Button
                    colorScheme={tradingBtnColor}
                    variant="solid"
                    rounded="2xl"
                    mt={10}
                    size="lg"
                    px={["50", "70", "90", "90"]}
                    fontSize="25px"
                    py={10}
                    borderRadius="full"
                    _hover={{ transform: "translateY(-2px)" }}
                    bgGradient={"linear(to-r,#74cecc,green.300,blue.400)"}
                  >
                    <Link
                      href="https://opensea.io/collection/shrub-paper-gardens"
                      isExternal
                    >
                      Own a seed
                    </Link>
                  </Button>
                )}
              </Center>
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

export default OrphanageView;
