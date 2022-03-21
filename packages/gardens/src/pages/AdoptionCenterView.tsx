import {
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
  Grid,
  Spinner,
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
import { ToastDescription, TxStatusList } from "../components/TxMonitoring";
import {
  getRegisterForAdoption,
  isRegisteredForAdoption,
  registerForAdoption,
  seedBalanceOf,
} from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useLazyQuery } from "@apollo/client";
import {
  SEED_ADOPTION_QUERY,
  SEED_OWNERSHIP_QUERY,
} from "../constants/queries";

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
  const [isInitialized, setIsInitialized] = useState(false);

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
    setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 500);
  }, []);

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
        {!isInitialized ? (
          <Center p={200}>
            <Spinner size="xl" />
          </Center>
        ) : (
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(1, 1fr)",
              lg: "repeat(1, 1fr)",
            }}
            gap={20}
            mt={50}
          >
            <Center>
              <Heading
                fontSize={{ base: "30px", md: "50px" }}
                letterSpacing={"tight"}
                textAlign={"center"}
                maxW="60rem"
              >
                Adopted seeds
              </Heading>
            </Center>

            {/*adoption history*/}
            <AdoptionHistory
              hooks={{
                seedAdoptionData,
                seedAdoptionLoading,
                isRegistered,
              }}
            />
          </Grid>
        )}
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
