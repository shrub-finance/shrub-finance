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
  SlideFade,
  Alert,
  AlertIcon,
  Image,
  Link,
  Spinner,
  Box,
  Grid,
  DrawerCloseButton,
  DrawerOverlay,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  Drawer,
  VStack,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { isMobile } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import { useLazyQuery } from "@apollo/client";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { TxStatusList } from "../components/TxMonitoring";
import { MY_GARDENS_QUERY } from "../constants/queries";
import { SeedBasketImg } from "../assets/Icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import SeedDetails from "../components/SeedDetails";

function MyPaperGardenView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };

  const btnShadow = useColorModeValue("md", "dark-lg");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const drawerSize = useBreakpointValue({
    base: "xs",
    md: "sm",
  });
  //@ts-ignore
  const openDrawer: boolean = useBreakpointValue({
    base: isOpen,
    md: false,
  });

  const [isHidden, setIsHidden] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mySeedRows, setMySeedRows] = useState<JSX.Element[]>([]);
  const [selectedItem, setSelectedItem] = useState<{
    name: string;
    emotion: string;
    type: string;
    dna: number;
  }>({
    name: "",
    emotion: "",
    type: "",
    dna: 0,
  });

  const { active, account, error: web3Error } = useWeb3React();

  const [
    getMySeedDataQuery,
    { loading: mySeedDataLoading, error: mySeedDataError, data: mySeedData },
  ] = useLazyQuery(MY_GARDENS_QUERY, {
    variables: {
      user: account && account.toLowerCase(),
    },
  });

  const holdsSeed = mySeedData && mySeedData.seeds && mySeedData.seeds.length;

  useEffect(() => {
    setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    if (holdsSeed) {
      const tempMySeedDataRows: JSX.Element[] = [];
      const mySeeds = [...mySeedData.seeds].sort(
        (a, b) => Number(a.id) - Number(b.id)
      );

      for (const item of mySeeds) {
        const { dna, type, name, emotion } = item;
        const seedNumber = name.split("#")[1];
        tempMySeedDataRows.push(
          <Box
            as="button"
            key={name}
            shadow={btnShadow}
            borderRadius="md"
            minW={20}
            h={32}
            p={2}
            cursor="pointer"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            _focus={{
              borderWidth: "2px",
              borderColor: "seed.600",
            }}
            onClick={() => {
              setSelectedItem({ name, emotion, type, dna });
              onOpen();
            }}
          >
            <VStack>
              <Box>
                <Image
                  w={20}
                  h={20}
                  src={
                    emotion === "sad"
                      ? `https://shrub.finance/${type.toLowerCase()}-sad.svg`
                      : `https://shrub.finance/${type.toLowerCase()}.svg`
                  }
                  alt="Seed"
                />
              </Box>
              <Text fontWeight={600} color="gray.500" fontSize="sm">
                #{seedNumber}
              </Text>
            </VStack>
          </Box>
        );
      }
      setMySeedRows(tempMySeedDataRows);
      setSelectedItem({
        name: mySeeds[0].name,
        emotion: mySeeds[0].emotion,
        type: mySeeds[0].type,
        dna: mySeeds[0].dna,
      });
    }

    if (mySeedData && mySeedData.seeds) {
      setIsInitialized(true);
    }
  }, [mySeedData]);

  useEffect(() => {
    async function main() {
      if (!account) {
        return;
      }
      getMySeedDataQuery();
    }
    main().catch((err) => {
      handleErrorMessages({ err });
      console.error(err);
    });
  }, [account]);

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.lg"
      >
        {/*error states*/}
        <Center mt={10}>
          {localError && (
            <SlideFade in={true} unmountOnExit={true}>
              <Alert variant={"shrubYellow"} status="info" borderRadius={9}>
                <AlertIcon />
                {localError}
              </Alert>
            </SlideFade>
          )}
        </Center>
        {/*heading*/}
        <Center>
          <VStack mb={{ base: 8, md: 14 }}>
            <Heading
              fontSize={{ base: "30px", md: "30px", lg: "50px" }}
              letterSpacing={"tight"}
              textAlign={"center"}
              maxW="60rem"
            >
              My Paper Garden
            </Heading>
            <Text
              textAlign="center"
              px={"5"}
              fontSize={{ base: "15px", md: "15px", lg: "18px" }}
            >
              Place where seeds grow into Shrubs!
            </Text>
          </VStack>
        </Center>
        {!isInitialized ? (
          <Center p={10}>
            <Spinner size="xl" />
          </Center>
        ) : !holdsSeed || !account ? (
          <Grid templateColumns="repeat(1, 1fr)">
            <Center>
              <SeedBasketImg boxSize={220} />
            </Center>
            <Center>
              <Box maxW="30rem" mb={8} fontSize="20px" textStyle={"reading"}>
                <Text pt="8">
                  {!account
                    ? "Please connect your wallet"
                    : !holdsSeed
                    ? "Your garden has no seeds"
                    : ""}
                </Text>
              </Box>
            </Center>
            <Center>
              {!holdsSeed && account && (
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
                  Get a Seed <ExternalLinkIcon mx="2px" />
                </Link>
              )}
            </Center>
          </Grid>
        ) : (
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
            gap="20"
          >
            {/*all seeds*/}
            <Box>
              <Grid
                templateColumns={
                  mySeedDataLoading || mySeedDataError
                    ? "repeat(1, 1fr)"
                    : { base: "repeat(4, 1fr)", md: "repeat(5, 1fr)" }
                }
                gap={2}
                minH={"565px"}
                overflow="scroll"
                maxH="620px"
                shadow="2xl"
                layerStyle={"shrubBg"}
                borderRadius="2xl"
                p={4}
              >
                {mySeedDataLoading || mySeedDataError ? (
                  <Center p={10}>
                    <Spinner size="xl" />
                  </Center>
                ) : (
                  mySeedRows
                )}
              </Grid>
            </Box>
            {/*seed details*/}
            <Box display={{ base: "none", md: "block" }}>
              <SeedDetails
                hooks={{
                  mySeedDataLoading,
                  mySeedDataError,
                  selectedItem,
                }}
              />
            </Box>
            <Drawer
              isOpen={openDrawer}
              placement="right"
              onClose={onClose}
              size={drawerSize}
              preserveScrollBarGap={true}
            >
              <DrawerOverlay />
              <DrawerContent pt={10}>
                <DrawerCloseButton />
                <DrawerBody>
                  <SeedDetails
                    hooks={{
                      mySeedDataLoading,
                      mySeedDataError,
                      selectedItem,
                    }}
                  />
                </DrawerBody>
                {/*<DrawerFooter>*/}
                {/*  <Button variant="outline" mr={3} onClick={onClose}>*/}
                {/*    Close*/}
                {/*  </Button>*/}
                {/*  <Button colorScheme="blue">Save</Button>*/}
                {/*</DrawerFooter>*/}
              </DrawerContent>
            </Drawer>
          </Grid>
        )}
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

export default MyPaperGardenView;
