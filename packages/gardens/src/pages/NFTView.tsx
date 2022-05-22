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
  Link,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import { Image } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
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
import { getTokenUri } from "../utils/ethMethods";
import axios from "axios";
const PAPERSEED_CONTRACT_ADDRESS =
  process.env.REACT_APP_PAPERSEED_ADDRESS || "";
import { FaTwitter } from "react-icons/all";
import { OpenSeaIcon, PostAdoptionImg } from "../assets/Icons";

function NFTView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const [isLoading, setIsLoading] = useState(false);
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
  const [rarity, setRarity] = useState("");
  const [emotion, setEmotion] = useState("");
  const [dna, setDna] = useState("");
  const [seedType, setSeedType] = useState("");
  const [nftTitle, setNftTitle] = useState("");
  const [tokenId, setTokenId] = useState(0);

  const { active, account, library, error: web3Error } = useWeb3React();

  const nftImageLink = `https://ipfs.io/ipfs/${nftImageId}`;
  const openSeaLink = `https://opensea.io/assets/matic/${PAPERSEED_CONTRACT_ADDRESS}/${tokenId}`;

  useEffect(() => {
    async function handleViewNFT() {
      setLocalError("");
      setNftImageId("");
      setTokenId(0);
      setNftTitle("");
      setRarity("");
      setDna("");
      setEmotion("");
      setSeedType("");
      setIsLoading(true);
      try {
        if (!account) {
          setIsLoading(false);
          setLocalError("Please connect your wallet first");
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
            let uri = await getTokenUri(
              // @ts-ignore
              props.tokenId,
              library
            );
            let nfti = "";
            let metadataName = "";
            let type = "";
            let rarity = "";
            let emotion = "";
            let dna = "";
            if (uri && uri.includes("://")) {
              uri = `https://ipfs.io/ipfs/${uri.split("://")[1]}`;
              const nftMetadata = await axios.get(uri);
              console.log(nftMetadata);
              if (
                nftMetadata.data.image &&
                nftMetadata.data.image.includes("://")
              ) {
                nfti = nftMetadata.data.image.split("://")[1];
                metadataName = nftMetadata.data.name;
                type = nftMetadata.data.attributes[0].value;
                rarity = nftMetadata.data.attributes[1].value;
                dna = nftMetadata.data.attributes[2].value;
                emotion = nftMetadata.data.attributes[3].value;
              }
            }
            setNftImageId(nfti);
            setNftTitle(metadataName);
            setEmotion(emotion);
            setDna(dna);
            setRarity(rarity);
            setSeedType(type);
            // @ts-ignore
            setTokenId(props.tokenId);
            setIsLoading(false);
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
    handleViewNFT().catch(console.error);
  }, [account]);

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.sm"
      >
        <Center mt={10}>
          {localError && (
            <SlideFade in={true} unmountOnExit={true}>
              <Center mb={6}>
                <Alert status="info" borderRadius={9}>
                  <AlertIcon />
                  {localError}
                </Alert>
              </Center>
              <Center
                borderRadius="2xl"
                flex="1"
                maxW="container.sm"
                bg={useColorModeValue("white", "dark.100")}
                shadow={useColorModeValue("2xl", "2xl")}
                py={10}
              >
                <PostAdoptionImg boxSize={400} />
              </Center>
            </SlideFade>
          )}
        </Center>
      </Container>

      {nftImageId && (
        <Container
          borderRadius="2xl"
          flex="1"
          maxW="container.sm"
          bg={useColorModeValue("white", "dark.100")}
          shadow={useColorModeValue("2xl", "2xl")}
          py={10}
        >
          {isLoading && (
            <Center>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Center>
          )}
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
              href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20adorable%20${nftTitle
                .replace(/w/g, "%20")
                .replace(
                  "#",
                  "%23"
                )} %23NFT%20I%20minted%20via%20%40shrubfinance.%0Ahttps%3A//opensea.io/assets/matic/${PAPERSEED_CONTRACT_ADDRESS}/${tokenId}/`}
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
            <>
              <Center pb={6}>
                <Image src={nftImageLink} boxSize={400} />
              </Center>
              <Center fontSize="sm" fontWeight={"bold"}>
                <Box>
                  DNA
                  <Box as="span" pl={5}>
                    {dna}
                  </Box>
                </Box>
              </Center>
              <Center fontSize="sm" fontWeight={"bold"}>
                <Box>
                  Class
                  <Box as="span" pl={5}>
                    {seedType}
                  </Box>
                </Box>
              </Center>
              <Center fontSize="sm" fontWeight={"bold"}>
                <Box>
                  Rarity
                  <Box as="span" pl={5}>
                    {rarity}
                  </Box>
                </Box>
              </Center>
              <Center fontSize="sm" fontWeight={"bold"}>
                <Box>
                  Emotion
                  <Box as="span" pl={5}>
                    {emotion}
                  </Box>
                </Box>
              </Center>
            </>
          )}
        </Container>
      )}

      {!account && (
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
                web3Error &&
                getErrorMessage(web3Error).title === "Wrong Network"
              ) && <TxStatusList />}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default NFTView;
