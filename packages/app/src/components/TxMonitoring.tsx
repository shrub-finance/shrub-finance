import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle, Spinner
} from '@chakra-ui/react';

function Txmonitor({confirmed, setConfirmationStatus, depositing, setDepositStatus} : any) {
   return(
       <>
       { depositing && <Alert
           status="success"
           variant="subtle"
           flexDirection="column"
           alignItems="center"
           justifyContent="center"
           textAlign="center"
           height="200px"
       >
           {/*<AlertIcon boxSize="40px" mr={0} />*/}
           <Spinner
               thickness="4px"
               speed="0.65s"
               emptyColor="gray.200"
               color="blue.500"
               size="xl"
           />
           <AlertTitle mt={4} mb={1} fontSize="lg">
               Waiting for confirmation
           </AlertTitle>
           <AlertDescription maxWidth="sm">
               Please confirm in your wallet.
           </AlertDescription>
       </Alert>}

           {confirmed && <Alert
        status="success"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
    >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
            Transaction Submitted
        </AlertTitle>
        <AlertDescription maxWidth="sm">

        </AlertDescription>
    </Alert>}
           </>
   ) ;
}

export default Txmonitor;

