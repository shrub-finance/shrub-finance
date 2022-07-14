import {
  Heading,
  Text,
  Button,
  Center,
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
} from "@chakra-ui/react";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";
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
import useTruncateAddress from "../hooks/useTruncateAddress";
import { b } from "../constants/dictionary";
import { trackEvent } from "../utils/handleGATracking";
import GardenStats from "../components/GardenStats";
function handleGA(event: any) {
  trackEvent({
    action: event.type,
    label: event.target.innerText,
  });
}

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
  const [leaderBoardRows, setLeaderBoardRows] = useState<JSX.Element[]>([]);
  const POLL_INTERVAL = 60000; // 15 second polling interval

  const {
    loading,
    error,
    data: leaderBoardData,
  } = useQuery(NFT_LEADERBOARD_QUERY, {
    variables: {
      numResults: 30,
      b: b,
    },
    pollInterval: POLL_INTERVAL, // Poll every ten seconds
  });

  useEffect(() => {
    if (leaderBoardData && leaderBoardData.users) {
      let i = 0;
      let lastRank = 0;
      let lastSeedCount = 0;
      const tempLeaderBoardRows: JSX.Element[] = [];
      for (const item of leaderBoardData.users) {
        i++;
        const { id, seedCount, seeds } = item;
        const rank = seedCount === lastSeedCount ? lastRank : i;

        const uniqueTypes = [...new Set(seeds.map((s: any) => s.type))];
        if (i > 21 && seedCount < leaderBoardData.users[9].seedCount) {
          break;
        }
        tempLeaderBoardRows.push(
          <Tr key={id}>
            <Td
              display={{ base: "none", md: "table-cell" }}
              fontWeight={rank === 1 ? "extrabold" : "medium"}
            >
              {rank}
            </Td>
            <Td
              fontWeight={rank === 1 ? "extrabold" : "medium"}
              fontSize={isMobile ? "12px" : "auto"}
            >
              {useTruncateAddress(id)}
            </Td>
            <Td fontWeight={rank === 1 ? "extrabold" : "medium"}>
              {seedCount}
            </Td>
            <Td>
              {loading ? (
                <Center>
                  {" "}
                  <Spinner size="xl" />
                </Center>
              ) : (
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
              )}
            </Td>
          </Tr>
        );

        lastSeedCount = seedCount;
        lastRank = rank;
      }
      setLeaderBoardRows(tempLeaderBoardRows);
    }
  }, [leaderBoardData]);

  const { active, error: web3Error } = useWeb3React();

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
        <GardenStats />
        <Center mt={12}>
          <Heading
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
            textAlign={"center"}
            maxW="60rem"
            mb={{ base: 8, md: 14 }}
          >
            Seed Leaderboard
          </Heading>
        </Center>
        <Center>
          <Table variant="simple" size="sm">
            <TableCaption>
              <Link
                fontSize="14px"
                as={ReachLink}
                to={"/opensea"}
                onClick={handleGA}
              >
                View in Open Sea
              </Link>
            </TableCaption>
            <Thead>
              <Tr>
                <Th display={{ base: "none", md: "block" }}>Rank</Th>
                <Th>Account</Th>
                <Th>Owns</Th>
                <Th>SeedType</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td display={{ base: "none", md: "block" }}>
                    <Spinner size="xs" />
                  </Td>
                  <Td>
                    <Spinner size="xs" />
                  </Td>
                  <Td>
                    <Spinner size="xs" />
                  </Td>
                  <Td>
                    <Spinner size="xs" />
                  </Td>
                </Tr>
              ) : (
                leaderBoardRows
              )}
            </Tbody>
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

export default LeaderBoardView;
