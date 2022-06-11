import {
  Box,
  Heading,
  Text,
  Button,
  Center,
  useColorModeValue,
  Container,
  Flex,
  Spacer,
  Circle,
  Stack,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  ListItem,
  PopoverBody,
  PopoverCloseButton,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Popover,
  UnorderedList,
  useRadioGroup,
  useBoolean,
  useColorMode,
} from "@chakra-ui/react";
import { ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons";
import { Img } from "@chakra-ui/react";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import { PolygonIcon } from "../assets/Icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import useAddNetwork from "../hooks/useAddNetwork";
import { isMobile } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { TxStatusList } from "../components/TxMonitoring";
import { BigNumber, ethers } from "ethers";
import { TxContext } from "../components/Store";
import { ToastDescription, Txmonitor } from "../components/TxMonitoring";
import { ShrubBalance, SupportedCurrencies } from "../types";
import { Currencies } from "../constants/currencies";
import { motion } from "framer-motion";

function MysteryBoxView(props: RouteComponentProps) {
  const [boxImg, setBoxImg] = useState("/box.svg");
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const addNetwork = useAddNetwork();
  const { colorMode } = useColorMode();
  const gold =
    "linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)";
  useColorModeValue("green.100", "teal.500");
  const bgConnect = useColorModeValue("white", "dark.100");
  const row1 = ["Box1", "Box2", "Box3", "Box4"];
  const row2 = ["Box5", "Box6", "Box7", "Box8"];

  const { account, error: web3Error } = useWeb3React();
  //TODO: Use it
  function handleConnect() {
    if (!account) {
      if (!!web3Error && getErrorMessage(web3Error).title === "Wrong Network") {
        return addNetwork();
      } else {
        return onConnectWalletOpen();
      }
    }

    console.log(addNetwork);
    return addNetwork();
  }

  function boxClick() {
    setBoxImg("/dud.webp");
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
        <Center mt={10}>
          <Box mb={10}>
            <Heading
              maxW="60rem"
              fontSize={["5xl", "6xl", "90px", "90px"]}
              fontWeight="bold"
              textAlign="center"
            >
              <Text as="span">Mystery</Text>
              <Text
                as="span"
                bgGradient={gold}
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                {" "}
                Box
              </Text>
            </Heading>
            <Text
              mt="3"
              mb={{ base: "16px", md: "20", lg: "20" }}
              color={useColorModeValue("gray.500", "gray.400")}
              fontSize="25px"
              textAlign="center"
              px={["4rem", "5rem", "17rem", "17rem"]}
            >
              What will you find?
            </Text>

            <Box maxW="60rem" mb={8} textAlign={"center"}>
              <Heading fontSize="50px">Click to Open!</Heading>
            </Box>

            <Flex
              direction={{ base: "row", md: "row", lg: "row" }}
              alignItems={{ base: "center", md: "center", lg: "center" }}
            >
              {row1.map((item, i) => (
                <>
                  <Box
                    maxW="200px"
                    minW="200px"
                    shadow="2xl"
                    borderRadius="2xl"
                    overflow="hidden"
                    mr={8}
                    bg={bgConnect}
                    onClick={boxClick}
                    cursor={"pointer"}
                  >
                    <Box py={2}>
                      <Stack py={6} align={"center"}>
                        <Box
                          as={motion.div}
                          whileHover={{
                            rotate: [-20, 20],
                            transition: {
                              duration: 0.5,
                              yoyo: Infinity,
                            },
                          }}
                        >
                          <Img src={boxImg} alt="Mystery Box" />
                        </Box>
                      </Stack>
                      <Stack align={"center"}>
                        <Heading fontSize={"xl"} fontWeight={"500"}>
                          {item}
                        </Heading>
                      </Stack>
                    </Box>
                  </Box>
                  <Spacer />
                </>
              ))}
            </Flex>
          </Box>
        </Center>
      </Container>

      <Container p={5} flex="1" borderRadius="2xl" maxW="container.lg">
        <Center>
          <Box mb={10}>
            <Flex
              direction={{ base: "row", md: "row", lg: "row" }}
              alignItems={{ base: "center", md: "center", lg: "center" }}
            >
              {row2.map((item, i) => (
                <>
                  <Box
                    maxW="200px"
                    minW="200px"
                    shadow="2xl"
                    borderRadius="2xl"
                    overflow="hidden"
                    mr={8}
                    bg={bgConnect}
                    onClick={boxClick}
                    cursor={"pointer"}
                  >
                    <Box py={2}>
                      <Stack py={6} align={"center"}>
                        <Box
                          as={motion.div}
                          whileHover={{
                            rotate: [20, -20],
                            transition: {
                              duration: 0.5,
                              yoyo: Infinity,
                            },
                          }}
                        >
                          <Img src={boxImg} alt="Mystery Box" />
                        </Box>
                      </Stack>
                      <Stack align={"center"}>
                        <Heading fontSize={"xl"} fontWeight={"500"}>
                          {item}
                        </Heading>
                      </Stack>
                    </Box>
                  </Box>
                  <Spacer />
                </>
              ))}
            </Flex>
          </Box>
        </Center>
      </Container>
    </>
  );
}

export default MysteryBoxView;
