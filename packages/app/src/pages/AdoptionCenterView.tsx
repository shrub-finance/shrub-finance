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
  UnorderedList,
  ListItem,
  Grid,
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
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
  getRegisterForAdoption,
  isRegisteredForAdoption,
  registerForAdoption,
  seedBalanceOf,
} from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";
import { AdoptionImg, SeedBasketImg } from "../assets/Icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FaTwitter } from "react-icons/all";
import { useLazyQuery } from "@apollo/client";
import {
  SEED_ADOPTION_QUERY,
  SEED_OWNERSHIP_QUERY,
} from "../constants/queries";

import UpcomingAdoptions from "../components/UpcomingAdoptions";
import AdoptionHistory from "../components/AdoptionHistory";

function AdoptionCenterView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSeedHolder, setIsSeedHolder] = useState(false);
  const toast = useToast();
  const tradingBtnColor = useColorModeValue("sprout", "teal");
  const ownSeedCTA = useColorModeValue("pink.600", "yellow.200");
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
  const [adoptionRegister, setAdoptionRegister] = useState<string[]>([]);
  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  const [
    getSeedOwnerShipQuery,
    {
      loading: seedOwnershipLoading,
      error: seedOwnershipError,
      data: seedOwnershipData,
    },
  ] = useLazyQuery(SEED_OWNERSHIP_QUERY, {
    variables: {
      address:
        process.env.REACT_APP_ORPHANAGE_ADDRESS &&
        process.env.REACT_APP_ORPHANAGE_ADDRESS.toLowerCase(),
    },
  });

  const [
    getSeedAdoptionQuery,
    {
      loading: seedAdoptionLoading,
      error: seedAdoptionError,
      data: seedAdoptionData,
    },
  ] = useLazyQuery(SEED_ADOPTION_QUERY, {
    variables: {
      numResults: 20,
    },
  });

  useEffect(() => {
    getSeedOwnerShipQuery();
    getSeedAdoptionQuery();
    async function main() {
      if (!account) {
        return;
      }
      const result = await isRegisteredForAdoption(library, account);
      setIsRegistered(result);
      const adoptionRegister = await getRegisterForAdoption(library);
      setAdoptionRegister(adoptionRegister);
    }
    main().catch((err) => {
      handleErrorMessages({ err });
      console.error(err);
    });
  }, [account]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  useEffect(() => {
    async function main() {
      if (!account) {
        return;
      }
      const result = await seedBalanceOf(library, account);
      const localSeedHolder = result.gt(0);
      setIsSeedHolder(localSeedHolder);
    }
    main().catch((err) => {
      handleErrorMessages({ err });
      console.error(err);
    });
  }, [account]);

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
    <Container maxW={{ base: "container.sm", md: "container.xl" }}>
      <Center mt={20}>
        {localError && (
          <SlideFade in={true} unmountOnExit={true}>
            <Alert status="info" variant="shrubYellow" borderRadius={9}>
              <AlertIcon />
              {localError.includes("'Account holds no seed NFTs") ? (
                <Text>
                  This address does not have any paper seeds. To adopt a seed
                  you have to first be a seed owner.{" "}
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
                  This address is already registered for adoption. Thank you for
                  giving a sad seed a happy home.
                </Text>
              ) : (
                localError
              )}
            </Alert>
          </SlideFade>
        )}
      </Center>
      {isRegistered && activeHash && <Confetti />}
      <Center>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(1, 1fr)",
            lg: isRegistered ? "repeat(1, 1fr)" : "repeat(3, 1fr)",
          }}
          gap={20}
          mt={50}
        >
          {isRegistered && (
            <Center>
              <Heading
                fontSize={{ base: "30px", md: "50px" }}
                letterSpacing={"tight"}
                textAlign={"center"}
                maxW="60rem"
              >
                Hello, Registered Gardener!
              </Heading>
            </Center>
          )}

          {/*upcoming adoption*/}
          <UpcomingAdoptions
            hooks={{
              adoptionRegister,
              seedOwnershipData,
              seedOwnershipLoading,
              isRegistered,
            }}
          />

          {/*adoption center */}
          {!isRegistered && (
            <Box>
              <Heading
                fontSize={{ base: "30px", md: "50px" }}
                letterSpacing={"tight"}
                mb={{ base: !isRegistered ? 0 : -20, md: 8 }}
                textAlign={"center"}
                maxW="60rem"
              >
                {!localError.includes("'Account already registered") ? (
                  <Text as="span">
                    {!isRegistered
                      ? "Seed Adoption Center"
                      : activeHash
                      ? "You did it!"
                      : "Seed Adoption Center"}
                  </Text>
                ) : (
                  <Text>You are all set</Text>
                )}
              </Heading>
              <Center px={4}>
                {!isRegistered &&
                  !activeHash &&
                  !localError.includes("'Account already registered") &&
                  !localError.includes("'Account holds no seed NFTs") && (
                    <Text
                      mt="8"
                      mb={{ base: "16px", md: "10", lg: "10" }}
                      textStyle={"reading"}
                      maxW={650}
                      fontSize="17px"
                    >
                      The Paper Merchant in his quest to find good homes for the
                      sad seeds has started an adoption center. He is attempting
                      to <strong>unite seeds with their siblings. </strong>
                      {!isSeedHolder && (
                        <Link
                          href="https://opensea.io/collection/shrub-paper-gardens"
                          isExternal
                          textAlign={"center"}
                          color={ownSeedCTA}
                          fontWeight={"bold"}
                        >
                          Help a seed in need. Become a seed owner
                          <ExternalLinkIcon ml={1} />
                        </Link>
                      )}
                      <UnorderedList mt={4}>
                        <ListItem pb={2}>
                          {" "}
                          <strong>2 seeds</strong> are up for adoption every
                          day. They are adopted by the users who have registered
                          for adoption.
                        </ListItem>
                        <ListItem pb={2}>
                          <strong>Batches last 1 week</strong>. Registration{" "}
                          <strong>must be renewed</strong> on a weekly basis.{" "}
                        </ListItem>
                        <ListItem pb={2}>
                          <strong>Registration is free</strong>, but you have to
                          be a <strong>seed owner to qualify.</strong>
                        </ListItem>
                        <ListItem pb={2}>
                          <strong>Owning a seed with the same DNA</strong> as
                          the one up for adoption,
                          <strong> increases your chance</strong> of being
                          selected as its adoptive gardener.
                        </ListItem>
                      </UnorderedList>
                    </Text>
                  )}
              </Center>
              {isRegistered && activeHash && (
                <Text
                  mt="3"
                  color={useColorModeValue("gray.700", "gray.300")}
                  fontSize="18px"
                  textAlign="center"
                  fontWeight="medium"
                  maxW="60rem"
                >
                  Thanks for registering for this batch!
                </Text>
              )}
              {isRegistered && activeHash && (
                <Center py={4} maxW="60rem">
                  <Link
                    href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fpaper.shrub.finance&text=I%20just%20registered%20to%20became%20a%20proud%20seed%20adopter%20on%20@shrubfinance%21%20Join%20me%20in%20giving%20a%20seed%20a%20home%21%20&hashtags=NFTs%2CDeFi%2Cweb3"
                    isExternal
                  >
                    <Button
                      variant="link"
                      colorScheme="twitter"
                      leftIcon={<FaTwitter />}
                    >
                      Tweet this!
                    </Button>
                  </Link>
                </Center>
              )}
              <Center position={!isRegistered ? "relative" : "static"}>
                <Center mt={{ base: 20, md: "-124px" }}>
                  {!isMobile ? (
                    !isRegistered ? (
                      <>
                        <AdoptionImg boxSize={{ base: 0, md: 640 }} />
                        <SeedBasketImg boxSize={{ base: 320, md: 0 }} pt={14} />
                      </>
                    ) : (
                      <></>
                    )
                  ) : (
                    <SeedBasketImg boxSize={320} pt={14} />
                  )}
                </Center>
                <Center top={{ base: 5, md: 0 }} position={"absolute"}>
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
                        isDisabled={!!account && !isSeedHolder}
                        size="lg"
                        fontSize={{ base: "20px", md: "25px" }}
                        py={10}
                        borderRadius="full"
                        _hover={{ transform: "translateY(-2px)" }}
                        bgGradient={"linear(to-r,#74cecc,green.300,blue.400)"}
                        loadingText="Registering..."
                      >
                        {account
                          ? isSeedHolder
                            ? "Register to adopt"
                            : "Must own a seed to adopt"
                          : !!web3Error &&
                            getErrorMessage(web3Error).title === "Wrong Network"
                          ? "Connect to Polygon"
                          : "Connect Wallet"}
                      </Button>
                    )}
                </Center>
              </Center>
            </Box>
          )}

          {/*adoption history*/}
          <AdoptionHistory
            hooks={{
              seedAdoptionData,
              seedAdoptionLoading,
              isRegistered,
            }}
          />
        </Grid>
      </Center>

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
    </Container>
  );
}

export default AdoptionCenterView;
