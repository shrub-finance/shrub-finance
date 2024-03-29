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
  CheckIcon,
  ExternalLinkIcon,
  Icon,
  TimeIcon,
} from "@chakra-ui/icons";
import { PendingTxState, potForWatering } from "../types";
import { VscError } from "react-icons/all";
import { isMobile } from "react-device-detect";
import { ExplorerDataType, explorerLink } from "../utils/chainMethods";
import { useWeb3React } from "@web3-react/core";
import { Planting } from "./animations/Planting";
import { useAnimation } from "framer-motion";
import Watering from "./animations/Watering";
import Fertilizing from "./animations/Fertilizing";
import WaterAll from "./animations/WaterAll";
import { Bounce } from "./animations/Bounce";
import Harvesting from "./animations/Harvesting";

export function Txmonitor({
  txHash,
  seed,
  emotion,
  growth,
  potsForWatering,
}: {
  txHash?: string;
  seed?: string;
  emotion?: string;
  growth?: number;
  potsForWatering?: potForWatering[];
}) {
  console.debug("rendering Txmonitor");
  const { chainId } = useWeb3React();
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState] = pendingTxs;
  const controls = useAnimation();

  // Start animation
  useEffect(() => {
    setTimeout(() => {
      controls.start("final");
    }, 1);
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

  function getGrowthAmount(description: string, emotion?: string) {
    return description === "Fertilizing"
      ? emotion === "sad"
        ? 2.07
        : 4.13
      : emotion === "sad"
      ? 1.38
      : 2.75;
  }

  return (
    <>
      {status === "confirming" &&
        (description === "Planting" ? (
          <Box>
            <Planting
              seedClass={seed || ""}
              emotion={emotion || ""}
              controls={controls}
            />
          </Box>
        ) : description === "Watering" ? (
          <Box>
            <Watering
              seedClass={seed || ""}
              emotion={emotion || ""}
              controls={controls}
              fromArg={(growth || 0) / 100}
              growthAmountArg={getGrowthAmount(description, emotion)}
            />
          </Box>
        ) : description === "Fertilizing" ? (
          <Box>
            <Fertilizing
              seedClass={seed || ""}
              emotion={emotion || ""}
              controls={controls}
              fromArg={(growth || 0) / 100}
              growthAmountArg={getGrowthAmount(description, emotion)}
            />
          </Box>
        ) : description === "Watering All" ? (
          <Box>
            <WaterAll
              controls={controls}
              potsForWatering={potsForWatering || []}
            />
          </Box>
        ) : (
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
            {Bounce(<TimeIcon boxSize="40px" />, "20%", "-20%", controls)}
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

      {/*{status === "confirmed" && (*/}
      {/*  <Box>*/}
      {/*<Fertilizing*/}
      {/*  seedClass={seed || ""}*/}
      {/*  emotion={emotion || ""}*/}
      {/*  controls={controls}*/}
      {/*  fromArg={(growth || 0) / 10000}*/}
      {/*  growthAmountArg={getGrowthAmount(description, emotion)}*/}
      {/*/>*/}
      {/*<Watering seedClass={seed || ""} emotion={emotion || ""} controls={controls} fromArg={(growth || 0) / 10000} growthAmountArg={getGrowthAmount(description, emotion)}/>*/}
      {/*<WaterAll controls={controls} potsForWatering={potsForWatering || []}/>*/}
      {/*  </Box>*/}
      {/*)}*/}

      {status === "confirmed" &&
        (description === "Harvesting Shrub" ? (
          <Box>
            <Harvesting seedClass={seed || ""} />
          </Box>
        ) : (
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            bg="none"
          >
            <CheckIcon boxSize={40} mr={0} color={"sprout.300"} />
            <AlertTitle mt={12} mb={1} fontSize="lg">
              Transaction Confirmed
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              <Link
                color={"gray"}
                fontSize={"sm"}
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
            <CheckIcon color="teal.400" />
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
