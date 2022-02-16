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
  Th,
  Tr,
  Td,
  Tbody,
  Thead,
  TableCaption,
  Table,
  Image,
  Stack,
  Link,
  Spinner,
  Box,
  HStack,
  WrapItem,
  Wrap,
  GridItem,
  Grid,
  DrawerHeader,
  DrawerCloseButton,
  DrawerOverlay,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  Drawer,
  SimpleGrid,
  Badge,
  VStack,
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
import { seedBalanceOf } from "../utils/ethMethods";
import { SeedBasketImg } from "../assets/Icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";

function LeaderBoardView(props: RouteComponentProps) {
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

  const { active, account, error: web3Error, library } = useWeb3React();
  const [
    getMySeedDataQuery,
    { loading: mySeedDataLoading, error: mySeedDataError, data: mySeedData },
  ] = useLazyQuery(MY_GARDENS_QUERY, {
    variables: {
      // user: account && account.toLowerCase(),
      user: "0x0073d46db23fa08221b76ba7f497c04b72bd3529",
    },
  });
  console.log(isInitialized);
  const holdsSeed = mySeedData && mySeedData.seeds && mySeedData.seeds.length;
  useEffect(() => {
    setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    console.log(mySeedData);
    if (holdsSeed) {
      const tempMySeedDataRows: JSX.Element[] = [];
      const mySeeds = [...mySeedData.seeds].sort(
        (a: any, b: any) => Number(a.id) - Number(b.id)
      );

      for (const item of mySeeds) {
        const { dna, type, name, emotion } = item;
        const seedNumber = name.split("#")[1];
        tempMySeedDataRows.push(
          <Box
            as="button"
            shadow="md"
            borderRadius="md"
            minW={20}
            p={2}
            layerStyle="shrubBg"
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
      console.log("setting");
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
          <Heading
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
            textAlign={"center"}
            maxW="60rem"
            mb={{ base: 8, md: 14 }}
          >
            My Paper Garden
          </Heading>
        </Center>
        {!isInitialized ? (
          <Center p={10}>
            <Spinner size="xl" />
          </Center>
        ) : !holdsSeed || !account ? (
          <Grid templateColumns="repeat(1, 1fr)">
            <Center>
              {console.log("hi")}
              {/*{console.log(isSeedHolder)}*/}
              {console.log(account)}
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
          <Grid templateColumns="repeat(2, 1fr)" gap={20}>
            {/*all seeds*/}
            <Box>
              <Grid
                templateColumns={
                  mySeedDataLoading || mySeedDataError
                    ? "repeat(1, 1fr)"
                    : "repeat(5, 1fr)"
                }
                gap={2}
                overflow="scroll"
                maxH="620px"
                shadow="2xl"
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
            <Box minW={400} maxH="614px">
              {mySeedDataLoading || mySeedDataError ? (
                <Center p={10}>
                  <Spinner size="xl" />
                </Center>
              ) : (
                <Box
                  w={"full"}
                  layerStyle="shrubBg"
                  boxShadow={"2xl"}
                  rounded={"xl"}
                  p={4}
                >
                  <Center>
                    <Image
                      objectFit={"cover"}
                      maxH="450px"
                      src={
                        selectedItem.emotion === "sad"
                          ? `https://shrub.finance/${selectedItem.type.toLowerCase()}-sad.svg`
                          : `https://shrub.finance/${selectedItem.type.toLowerCase()}.svg`
                      }
                      alt="Seed"
                    />
                  </Center>
                  <Center mt={6}>
                    <Heading fontSize={"2xl"}>{selectedItem.name}</Heading>
                  </Center>
                  <Stack
                    align={"center"}
                    justify={"center"}
                    direction={"row"}
                    mt={6}
                  >
                    <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                      Rarity:{" "}
                      {selectedItem.type === "Hope"
                        ? "Rare"
                        : selectedItem.type === "Power"
                        ? "Legendary"
                        : selectedItem.type === "Passion"
                        ? "Uncommon"
                        : "Common"}
                    </Badge>
                    <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                      Emotion: {selectedItem.emotion}
                    </Badge>
                  </Stack>
                  <Stack
                    align={"center"}
                    justify={"center"}
                    direction={"row"}
                    mt={2}
                  >
                    <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                      Class: {selectedItem.type}
                    </Badge>
                    <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                      DNA: {selectedItem.dna}
                    </Badge>
                  </Stack>

                  {/*<Stack mt={8} direction={"row"} spacing={4}>*/}
                  {/*  <Button*/}
                  {/*    flex={1}*/}
                  {/*    fontSize={"sm"}*/}
                  {/*    rounded={"full"}*/}
                  {/*    _focus={{*/}
                  {/*      bg: "gray.200",*/}
                  {/*    }}*/}
                  {/*  >*/}
                  {/*    Action A*/}
                  {/*  </Button>*/}
                  {/*  <Button*/}
                  {/*    flex={1}*/}
                  {/*    fontSize={"sm"}*/}
                  {/*    rounded={"full"}*/}
                  {/*    bg={"blue.400"}*/}
                  {/*    color={"white"}*/}
                  {/*    boxShadow={*/}
                  {/*      "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"*/}
                  {/*    }*/}
                  {/*    _hover={{*/}
                  {/*      bg: "blue.500",*/}
                  {/*    }}*/}
                  {/*    _focus={{*/}
                  {/*      bg: "blue.500",*/}
                  {/*    }}*/}
                  {/*  >*/}
                  {/*    Plant*/}
                  {/*  </Button>*/}
                  {/*</Stack>*/}
                </Box>
              )}
            </Box>
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

export default LeaderBoardView;
