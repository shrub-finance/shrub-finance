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
  const [mySeedRows, setMySeedRows] = useState<JSX.Element[]>([]);

  const { active, account, error: web3Error } = useWeb3React();
  const [
    getMySeedDataQuery,
    { loading: mySeedDataLoading, error: mySeedDataError, data: mySeedData },
  ] = useLazyQuery(MY_GARDENS_QUERY, {
    variables: {
      // user: account && account.toLowerCase(),
      user: "0x0073d46db23fa08221b76ba7f497c04b72bd3529",
    },
  });

  useEffect(() => {
    if (mySeedData && mySeedData.seeds && mySeedData.seeds.length) {
      const tempMySeedDataRows: JSX.Element[] = [];

      for (const item of mySeedData.seeds) {
        const { dna, type, name, emotion, id } = item;
        tempMySeedDataRows.push(
          <Center
            shadow="md"
            borderRadius="md"
            minW={20}
            p={2}
            layerStyle="shrubBg"
          >
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
          </Center>
        );
      }
      setMySeedRows(tempMySeedDataRows);
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
        <Grid templateColumns="repeat(2, 1fr)" gap={20}>
          <Box>
            <Grid templateColumns="repeat(5, 1fr)" gap={2}>
              {mySeedRows}
            </Grid>
          </Box>
          <Box minW={400}>
            <Center>
              <Box
                w={"full"}
                layerStyle="shrubBg"
                boxShadow={"2xl"}
                rounded={"xl"}
                p={10}
              >
                <Image
                  // h={"120px"}
                  // w={"full"}
                  src={"https://shrub.finance/wonder-sad.svg"}
                  objectFit={"cover"}
                />
                <Center mt={6}>
                  <Heading fontSize={"2xl"}>Lindsey James</Heading>
                </Center>
                <Center>
                  <Text fontWeight={600} color={"gray.500"} mb={4}>
                    @lindsey_jam3s
                  </Text>
                </Center>
                {/*<Text*/}
                {/*  textAlign={"center"}*/}
                {/*  color={useColorModeValue("gray.700", "gray.400")}*/}
                {/*  px={3}*/}
                {/*>*/}
                {/*  Actress, musician, songwriter and artist. PM for work inquires*/}
                {/*  or{" "}*/}
                {/*  <Link href={"#"} color={"blue.400"}>*/}
                {/*    #tag*/}
                {/*  </Link>{" "}*/}
                {/*  me in your posts*/}
                {/*</Text>*/}

                <Stack
                  align={"center"}
                  justify={"center"}
                  direction={"row"}
                  mt={6}
                >
                  {/*<Badge*/}
                  {/*  px={2}*/}
                  {/*  py={1}*/}
                  {/*  bg={useColorModeValue("gray.50", "gray.800")}*/}
                  {/*  fontWeight={"400"}*/}
                  {/*>*/}
                  {/*  #art*/}
                  {/*</Badge>*/}
                  {/*<Badge*/}
                  {/*  px={2}*/}
                  {/*  py={1}*/}
                  {/*  bg={useColorModeValue("gray.50", "gray.800")}*/}
                  {/*  fontWeight={"400"}*/}
                  {/*>*/}
                  {/*  #photography*/}
                  {/*</Badge>*/}
                  {/*<Badge*/}
                  {/*  px={2}*/}
                  {/*  py={1}*/}
                  {/*  bg={useColorModeValue("gray.50", "gray.800")}*/}
                  {/*  fontWeight={"400"}*/}
                  {/*>*/}
                  {/*  #music*/}
                  {/*</Badge>*/}
                </Stack>

                <Stack mt={8} direction={"row"} spacing={4}>
                  <Button
                    flex={1}
                    fontSize={"sm"}
                    rounded={"full"}
                    _focus={{
                      bg: "gray.200",
                    }}
                  >
                    Water
                  </Button>
                  <Button
                    flex={1}
                    fontSize={"sm"}
                    rounded={"full"}
                    bg={"blue.400"}
                    color={"white"}
                    boxShadow={
                      "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
                    }
                    _hover={{
                      bg: "blue.500",
                    }}
                    _focus={{
                      bg: "blue.500",
                    }}
                  >
                    Plant
                  </Button>
                </Stack>
              </Box>
            </Center>
          </Box>
        </Grid>
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
