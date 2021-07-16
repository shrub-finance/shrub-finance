import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle, Center, Link, Spinner
} from '@chakra-ui/react';
import React, {useContext} from "react";
import {TxContext} from "./Store";
import {ExternalLinkIcon, TimeIcon} from "@chakra-ui/icons";
import {HappyBud} from "../assets/Icons";


export function Txmonitor({txHash}:{txHash?: string}) {
    console.log('rendering txmonitor');
    console.log(txHash);

    const [pendingTxsState, pendingTxsDispatch] = useContext(TxContext);
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
                >
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
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
    const {description, status} = pendingTxsState[txHash]
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
            >
                <TimeIcon boxSize="40px"/>
                <AlertTitle mt={4} mb={1} fontSize="lg">
                    Transaction Confirming...
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                    <Link color={"cyan"} fontSize={"sm"} href={`https://etherscan.io/tx/${txHash}`} isExternal>
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
            >
              <AlertIcon boxSize="40px" mr={0}/>
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Transaction Confirmed
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                  <Link color={"cyan"} fontSize={"sm"} href={`https://etherscan.io/tx/${txHash}`} isExternal>
                      View on explorer <ExternalLinkIcon mx="2px" />
                  </Link>

                  <Center>
                      <HappyBud mt={8} boxSize={200} />
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
                    <Link color={"cyan"} fontSize={"sm"} href={`https://etherscan.io/tx/${txHash}`} isExternal>
                        View on explorer <ExternalLinkIcon mx="2px" />
                    </Link>

                </AlertDescription>
            </Alert>}
        </>
    );
}
