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
  SlideFade,
  Alert,
  AlertIcon,
  Th,
  Tr,
  Tfoot,
  Td,
  Tbody,
  Thead,
  TableCaption,
  Table,
  Image,
  Stack,
  Link,
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import React, { useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { isMobile } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@apollo/client";

import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { TxStatusList } from "../components/TxMonitoring";
import { NFT_LEADERBOARD_QUERY } from "../constants/queries";
import { ExternalLinkIcon } from "@chakra-ui/icons";
function NFTView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const headingColor = useColorModeValue(
    "linear(to-l, #50514f, #54885d)",
    "linear(to-l, #e3d606, #54885d, #b1e7a1, #a1beaf, #cd5959)"
  );
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };
  const [isHidden, setIsHidden] = useState(false);
  const leaderBoardRows: JSX.Element[] = [];
  const POLL_INTERVAL = 60000; // 15 second polling interval

  const dictionary: { [address: string]: string } = {
    "0x0073d46db23fa08221b76ba7f497c04b72bd3529": "Willdabeast00",
    "0x1748657e354e30247fcdbb403e69e9dc3d9a7735": "Dafeng",
    "0xdfc107cc5e5f4064c717966f8d54311afe97142a": "adadcarry",
    "0xcd6b6d99b7751ff30b68fa1365488eb73fa7cefa": "kingnftvn",
    "0x524a163e38e69fc120415875200922109a62ca05": "CrabInc",
    "0x4b38ef4dbd564019a2fc51b6b280b736c62e0ae8": "niuning95",
    "0x2553e6471c779ab3278ffa21300e12725ab5ab2f": "CypressPond",
    "0xdc93fef5564989471d0ac9b047a95a5c8491b002": "0xbtroot",
    "0x704de6418d5cac37bc5607290fbcbcb7a3b274b7": "Alexfawcett",
    "0xbcd8671f0799646573f73e9aafb875219a8721a5": "xiuc",
    "0xaa4efd397ed95854a1aabbd0d3c0f9a22583aca7": "0xbitsun",
    "0x41a24d16715e5c0db012334595017abea537d33e": "nickewansmith.eth",
    "0x12fe20de6b441f18ba9a3c9a7a78c9bd16723e8d": "188btc.eth",
    "0x597f0f68aa64a2216d395d4829d4657a2f3fa745": "ariswap",
    "0x0c7cdee7f65f2be9d3d241a8caf43fd2773e263b": "wealthfreedom.eth",
    "0xc17ec9d8e72ab957ac73596846ac87b8c7f80be2": "Block_Invest1",
  };

  const {
    loading,
    error,
    data: leaderBoardData,
  } = useQuery(NFT_LEADERBOARD_QUERY, {
    variables: {
      numResults: 20,
      b: ["0xc5e7c5032d203b69da4d8feb7f3c3179fd9cb83b"],
    },
    pollInterval: POLL_INTERVAL, // Poll every ten seconds
  });

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: ${handleErrorMessages({ err: error })}</p>;
  }
  let i = 0;

  // Captures 0x + 4 characters, then the last 4 characters.
  const truncateRegex = /^([a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

  /**
   * Source: https://github.com/gpxl-dev/truncate-eth-address
   * Truncates an ethereum address to the format 0x00…0000
   */
  const truncateEthAddress = (address: string) => {
    if (dictionary[address]) {
      return dictionary[address];
    }
    const match = address.match(truncateRegex);
    if (!match) {
      return address;
    }
    return `${match[1]}…${match[2]}`;
  };

  let lastRank = 0;
  let lastSeedCount = 0;

  for (const item of leaderBoardData.users) {
    i++;
    const { id, seedCount, seeds } = item;
    const rank = seedCount === lastSeedCount ? lastRank : i;

    const uniqueTypes = [...new Set(seeds.map((s: any) => s.type))];
    if (i > 10 && seedCount < leaderBoardData.users[9].seedCount) {
      break;
    }
    leaderBoardRows.push(
      <Tr>
        <Td fontWeight={rank === 1 ? "extrabold" : "medium"}>{rank}</Td>
        <Td
          fontWeight={rank === 1 ? "extrabold" : "medium"}
          fontSize={isMobile ? "12px" : "auto"}
        >
          {truncateEthAddress(id)}
        </Td>
        <Td fontWeight={rank === 1 ? "extrabold" : "medium"}>{seedCount}</Td>
        <Td>
          <Stack direction="row" spacing="0">
            {uniqueTypes.includes("Power") && (
              <Image
                boxSize={isMobile ? 5 : 9}
                src="https://shrub.finance/power.svg"
                alt="Power Seed"
              />
            )}
            {uniqueTypes.includes("Hope") && (
              <Image
                boxSize={isMobile ? 5 : 9}
                src="https://shrub.finance/hope.svg"
                alt="Hope Seed"
              />
            )}
            {uniqueTypes.includes("Passion") && (
              <Image
                boxSize={isMobile ? 5 : 9}
                src="https://shrub.finance/passion.svg"
                alt="Passion Seed"
              />
            )}
            {uniqueTypes.includes("Wonder") && (
              <Image
                boxSize={isMobile ? 5 : 9}
                src="https://shrub.finance/wonder.svg"
                alt="Wonder Seed"
              />
            )}
          </Stack>
        </Td>
      </Tr>
    );

    lastSeedCount = seedCount;
    lastRank = rank;
  }

  const {
    active,

    error: web3Error,
  } = useWeb3React();

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
              <Alert variant={"shrubYellow"} status="info" borderRadius={9}>
                <AlertIcon />
                {localError}
              </Alert>
            </SlideFade>
          )}
        </Center>
        <Center>
          <Heading
            maxW="60rem"
            fontSize={["xl", "3xl", "3xl", "4xl"]}
            fontWeight={{ base: "semibold", md: "medium" }}
            textAlign="center"
            mb="10"
          >
            <Text
              as="span"
              bgGradient={headingColor}
              bgClip="text"
              boxDecorationBreak="clone"
            >
              Paper Gardener's Leaderboard
            </Text>
          </Heading>
        </Center>
        <Center>
          <Table variant="simple" size="sm">
            <TableCaption>
              <Link
                fontSize="14px"
                href="https://opensea.io/collection/shrub-paper-gardens"
                isExternal
              >
                View collection in Open Sea <ExternalLinkIcon mx="2px" />
              </Link>
            </TableCaption>
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Account</Th>
                <Th>Owns</Th>
                <Th>SeedType</Th>
              </Tr>
            </Thead>
            <Tbody>{leaderBoardRows}</Tbody>
          </Table>
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

export default NFTView;
