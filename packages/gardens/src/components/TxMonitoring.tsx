import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Flex,
  Link,
  Spacer,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { TxContext } from "./Store";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  Icon,
  TimeIcon,
} from "@chakra-ui/icons";
import { PendingTxState } from "../types";
import { VscError } from "react-icons/all";
import { isMobile } from "react-device-detect";
import { ExplorerDataType, explorerLink } from "../utils/chainMethods";
import { useWeb3React } from "@web3-react/core";
import { Planting } from "./animations/Planting";
import { useAnimation } from "framer-motion";

export function Txmonitor({
  txHash,
  seed,
  emotion,
}: {
  txHash?: string;
  seed?: string;
  emotion?: string;
}) {
  // TODO: Make this dynamic
  const seedId = "100";
  console.debug("rendering Txmonitor");
  const { chainId } = useWeb3React();
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState] = pendingTxs;
  const controls = useAnimation();
  const [lastSeed, setLastSeed] = useState("");

  useEffect(() => {
    if (lastSeed !== seed) {
      setTimeout(() => {
        controls.start("final");
      }, 1);
      setLastSeed(seed || "");
    }
  }, []);

  if (!txHash) {
    return (
      <>
        {
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            bg="none"
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="sprout.300"
              size="xl"
            />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Waiting for approval
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Please continue in your wallet
            </AlertDescription>
          </Alert>
        }
      </>
    );
  }
  const { status, description } = pendingTxsState[txHash];
  console.debug(pendingTxsState[txHash]);

  return (
    <>
      {status === "confirming" &&
        (description === "Planting" ? (
          <></>
        ) : (
          // <Box><Planting seedClass={seed || ''} emotion={emotion || ''} id={seedId} /></Box>
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            mt="20px"
            bg="none"
          >
            <TimeIcon boxSize="40px" />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Transaction Confirming...
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              <Link
                color={"gray"}
                fontSize={"sm"}
                // @ts-ignore
                href={explorerLink(
                  chainId,
                  txHash,
                  ExplorerDataType.TRANSACTION
                )}
                isExternal
              >
                View on explorer <ExternalLinkIcon mx="2px" />
              </Link>
            </AlertDescription>
          </Alert>
        ))}

      {/*This is for testing planting animation*/}
      {/*{status === "confirmed" && <Box>{Planting(seed || "", emotion || "", seedId)}</Box>}*/}
      {status === "confirmed" && (
        <Box>
          <Planting
            seedClass={seed || ""}
            emotion={emotion || ""}
            id={seedId}
            controls={controls}
          />
        </Box>
      )}

      {/*{status === "confirmed" && (*/}
      {/*  <Alert*/}
      {/*    status="success"*/}
      {/*    variant="subtle"*/}
      {/*    flexDirection="column"*/}
      {/*    alignItems="center"*/}
      {/*    justifyContent="center"*/}
      {/*    textAlign="center"*/}
      {/*    bg="none"*/}
      {/*  >*/}
      {/*    <AlertIcon boxSize={40} mr={0} color={"sprout.300"} />*/}
      {/*    <AlertTitle mt={12} mb={1} fontSize="lg">*/}
      {/*      Transaction Confirmed*/}
      {/*    </AlertTitle>*/}
      {/*    <AlertDescription maxWidth="sm">*/}
      {/*      <Link*/}
      {/*        color={"gray"}*/}
      {/*        fontSize={"sm"}*/}
      {/*        href={explorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)}*/}
      {/*        isExternal*/}
      {/*      >*/}
      {/*        View on explorer <ExternalLinkIcon mx="2px" />*/}
      {/*      </Link>*/}
      {/*    </AlertDescription>*/}
      {/*  </Alert>*/}
      {/*)}*/}

      {status === "failed" && (
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          mt="20px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Transaction Rejected
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            <Link
              color={"gray"}
              fontSize={"sm"}
              href={explorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)}
              isExternal
            >
              View on explorer <ExternalLinkIcon mx="2px" />
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

export function confirmingCount(pendingTxsState: PendingTxState) {
  return Object.values(pendingTxsState).filter(
    (txState) => txState.status === "confirming"
  ).length;
}

// displayed inside connect wallet modal
export function TxStatusList() {
  const { pendingTxs } = useContext(TxContext);
  const { chainId, account, active } = useWeb3React();
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const entries = Object.entries(pendingTxsState)
    .sort((a, b) => b[1].created.getTime() - a[1].created.getTime())
    //  Only retain the most recent 10 records
    .slice(0, 10);
  const list: React.ReactElement[] = [];

  for (const [txHash, { description, status }] of entries) {
    list.push(
      <Flex pt={3} pb={1}>
        <Box
          color={status === "failed" ? "red.500" : "teal.500"}
          fontWeight="medium"
          letterSpacing="tight"
          fontSize="xs"
          ml="2"
        >
          <Link
            href={explorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)}
            isExternal
          >
            {description}
          </Link>
        </Box>
        <Spacer />
        <Box color="sprout.500" fontWeight="medium" fontSize="xs" ml="2">
          {status === "confirming" ? (
            <Spinner
              thickness="1px"
              speed="0.65s"
              emptyColor="blue.200"
              color="teal.500"
              size="xs"
              label="loading"
            />
          ) : status === "confirmed" ? (
            <CheckCircleIcon color="teal.400" />
          ) : (
            <Icon as={VscError} color="red.400" boxSize={3} />
          )}
        </Box>
      </Flex>
    );
  }
  console.debug(entries);
  console.debug(pendingTxsState);
  console.debug(list);

  const shadow = useColorModeValue("base", "dark-lg");
  const bgColor = useColorModeValue("gray.100", "dark.300");

  return (
    <>
      {(account || active) && (
        <Box p={3} mb={5} boxShadow={shadow} rounded="lg" bg={bgColor}>
          <Flex pt={1}>
            {list.length ? (
              <>
                <Box
                  color="gray.500"
                  fontWeight="medium"
                  letterSpacing="wide"
                  fontSize="sm"
                  ml="2"
                >
                  Recent Transactions
                </Box>
                <Spacer />
                <Box>
                  <Button
                    size={"xs"}
                    borderRadius="full"
                    cursor="pointer"
                    variant="ghost"
                    colorScheme="green"
                    onClick={() => pendingTxsDispatch({ type: "clear" })}
                  >
                    Clear all
                  </Button>
                </Box>
              </>
            ) : (
              <Center
                color="gray.500"
                fontWeight="medium"
                letterSpacing="wide"
                fontSize={isMobile ? "md" : "lg"}
                ml="2"
              >
                Transactions will show up here...
              </Center>
            )}
          </Flex>
          {list}
        </Box>
      )}
    </>
  );
}

export function ToastDescription(
  description: string,
  txHash: string,
  chainId: any
) {
  return (
    <>
      <Box>{description}</Box>
      <Box>
        <Link
          href={explorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)}
          isExternal
        >
          View on explorer
        </Link>
      </Box>
    </>
  );
}
