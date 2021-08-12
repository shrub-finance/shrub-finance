import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle, Box, Button, Center, Flex, Link, Spacer, Spinner, useColorModeValue
} from '@chakra-ui/react';
import React, {useContext} from "react";
import {TxContext} from "./Store";
import {CheckCircleIcon, ExternalLinkIcon, Icon, TimeIcon} from "@chakra-ui/icons";
import {HappyBud} from "../assets/Icons";
import {PendingTxState} from "../types";
import {VscError} from "react-icons/all";


export function Txmonitor({txHash}:{txHash?: string}) {
    console.log(txHash);

    const { pendingTxs } = useContext(TxContext);
    const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
    console.log(txHash);
    if (!txHash) {
        return (
            <>
                {<Alert
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
                    color="bud.100"
                    size="xl"
                  />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    Waiting for approval
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    Please continue with your wallet.
                  </AlertDescription>
                </Alert>}
            </>
        )
    }
    const {status} = pendingTxsState[txHash]
    console.log(pendingTxsState[txHash]);

    console.log(status)
    return (
        <>
            {status === 'confirming' && <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              bg="none"
            >
                <TimeIcon boxSize="40px"/>
                <AlertTitle mt={4} mb={1} fontSize="lg">
                    Transaction Confirming...
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                    <Link color={"gray"} fontSize={"sm"} href={`https://etherscan.io/tx/${txHash}`} isExternal>
                        View on explorer <ExternalLinkIcon mx="2px" />
                    </Link>
                </AlertDescription>
            </Alert>}


            {status === 'confirmed' && <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="400px"
              bg="none"
            >
              <AlertIcon boxSize="40px" mr={0} color={"bud.100"}/>
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Transaction Confirmed
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                  <Link color={"gray"} fontSize={"sm"} href={`https://etherscan.io/tx/${txHash}`} isExternal>
                      View on explorer <ExternalLinkIcon mx="2px" />
                  </Link>

                  <Center>
                      <HappyBud mt={8} boxSize={260} />
                  </Center>
              </AlertDescription>
            </Alert>}


            {status === 'failed' && <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
            >
                <AlertIcon boxSize="40px" mr={0}/>
                <AlertTitle mt={4} mb={1} fontSize="lg">
                    Transaction Rejected
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                    <Link color={"gray"} fontSize={"sm"} href={`https://etherscan.io/tx/${txHash}`} isExternal>
                        View on explorer <ExternalLinkIcon mx="2px" />
                    </Link>

                </AlertDescription>
            </Alert>}
        </>
    );
}

export function confirmingCount(pendingTxsState: PendingTxState) {
    return Object.values(pendingTxsState).filter(txState => txState.status === 'confirming').length
}

export function TxStatusList() {
    console.log('rendering TxStatusList');
    const { pendingTxs } = useContext(TxContext);
    const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
    const entries = Object.entries(pendingTxsState)
      .sort((a,b) => b[1].created.getTime() - a[1].created.getTime())
      //  Only retain the most recent 10 records
      .slice(0, 10)
    const list:React.ReactElement[] = []

    for (const [txHash, {description, status}] of entries) {
        list.push(
          <Flex pt={3} pb={1}>
              <Box color={status === 'failed' ? 'red.500' : 'teal.500'} fontWeight="semibold" letterSpacing="tight" fontSize="xs" ml="2">
                  <Link href={`https://etherscan.io/tx/${txHash}`} isExternal>
                      {description}
                  </Link>
              </Box>
              <Spacer/>
              <Box color="green.500" fontWeight="semibold"  fontSize="xs" ml="2">
                  { status === 'confirming'?
                    <Spinner thickness="1px" speed="0.65s" emptyColor="blue.200" color="teal.500" size="xs" label="loading" /> :
                    status === 'confirmed' ?
                      <CheckCircleIcon color="teal.400"/> :
                      <Icon as={VscError} color="red.400" boxSize={3}/>
                  }
              </Box>
          </Flex>
        )
    }
    console.log(entries);
    console.log(pendingTxsState);
    console.log(list);

    const shadow = useColorModeValue("base", "dark-lg");
    const bgColor =useColorModeValue("gray.100", "shrub.300");


    return (
      <>
          <Box p={3} mb={5} boxShadow={shadow} rounded="lg" bg={bgColor}>
              <Flex pt={1}>
                  {list.length ?
                    <>
                        <Box color="gray.500" fontWeight="semibold" letterSpacing="wide" fontSize="sm" ml="2">
                            Recent Transactions
                        </Box>
                        <Spacer/>
                        <Box>
                            <Button size={"xs"} borderRadius="full" cursor="pointer"
                                    variant="ghost" colorScheme="green" onClick={() => pendingTxsDispatch({type: 'clear'})}>
                                Clear all
                            </Button>
                        </Box>
                    </>
                    :
                      <Center color="gray.500" fontWeight="semibold" letterSpacing="wide" fontSize="lg" ml="2">
                      Transactions will show up here...
                      </Center>
                  }

              </Flex>
              {list}

          </Box>
      </>

    )

}

export function ToastDescription(description: string, txHash: string) {
    return <>
        <Box>
            {description}
        </Box>
        <Box>
            <Link href={`https://etherscan.io/tx/${txHash}`} isExternal>View on etherscan</Link>
        </Box>
    </>
}
