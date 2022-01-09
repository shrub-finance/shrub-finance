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
} from "@chakra-ui/react";
import { ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import { PolygonIcon } from "../assets/Icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import useAddNetwork from "../hooks/useAddNetwork";
import { isMobile } from "react-device-detect";
import Faucet from "../components/Faucet";
import { useWeb3React } from "@web3-react/core";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { TxStatusList } from "../components/TxMonitoring";
import { TxContext } from "../components/Store";

function PaperView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const addNetwork = useAddNetwork();
  const connectedColor = useColorModeValue("green.100", "teal.500");
  const bgConnect = useColorModeValue("white", "dark.100");
  const questionColor = useColorModeValue("blue", "yellow.300");
  const stepsColor = useColorModeValue("white", "black");
  const connectedStepColor = useColorModeValue("green.400", "white");
  const stepsBg = useColorModeValue("yellow.300", "gray.500");
  const connectedStepBg = useColorModeValue("white", "dark.100");
  const tradingBtnColor = useColorModeValue("sprout", "teal");
  const mobileStepsBtnBg = useColorModeValue(
    "linear(to-r, sprout.200, teal.200)",
    "linear(to-l, blue.700, teal.700)"
  );
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };
  const [isHidden, setIsHidden] = useState(false);

  const {
    active,
    library,
    account,
    error: web3Error,
    chainId,
  } = useWeb3React();

  function handleConnect() {
    if (!account) {
      if (!!web3Error && getErrorMessage(web3Error).title === "Wrong Network") {
        return addNetwork();
      } else {
        return onConnectWalletOpen();
      }
    }
    // if (account) {
    //   // fire mint your NFT method
    // if(not claimed) {
    //   "yay! you just minted the first Shrub NFT. Only 5000 of such kind exist, and ever will! So congrats"
    // Show image
    // }
    // if(already claimed) {
    //   "already claimed"
    // }
    // if(not eligible) {
    //   "this account is not eligible for the NFT"
    // }

    // }
    console.log(addNetwork);
    return addNetwork();
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
              <Text
                as="span"
                bgGradient="linear(to-l, #e3d606, #54885d, #b1e7a1, #a1beaf, #cd5959)"
                bgClip="text"
                boxDecorationBreak="clone"
              >
                Shrub Paper NFT
              </Text>
            </Heading>
            <Text
              mt="3"
              mb={{ base: "16px", md: "10", lg: "10" }}
              color={useColorModeValue("gray.700", "gray.300")}
              fontSize="18px"
              textAlign="center"
              fontWeight="bold"
              px={["4rem", "5rem", "17rem", "17rem"]}
              bgGradient="linear(to-r, #bd2bdd, #bfd71c, #c94b09)"
              bgClip="text"
            >
              {isMobile
                ? "Time to mint your drop!"
                : "Time to mint your drop. Let's go!"}
            </Text>
            <Center>
              <Button
                onClick={handleConnect}
                colorScheme={tradingBtnColor}
                variant="solid"
                rounded="2xl"
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
                  : // "Connect to Mumbai"
                    "Connect Wallet"}
              </Button>
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
