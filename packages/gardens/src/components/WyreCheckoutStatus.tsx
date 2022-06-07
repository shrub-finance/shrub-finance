import { 
    Alert, 
    AlertIcon, 
    AlertTitle, 
    AlertDescription, 
    Box, 
    CloseButton, 
    Center, 
    useDisclosure 
} from "@chakra-ui/react";

function WyreCheckoutStatus() {
    // look for a wyreCheckoutStatus query param in the url
    const currentURL = new URL(window.location.href);
    const currentURLParams = new URLSearchParams(currentURL.search);
    const wyreCheckoutStatus = currentURLParams.get('wyreCheckoutStatus');
    // do things based on wyreCheckoutStatus
    let description;
    let status: "error" | undefined;
    switch (wyreCheckoutStatus) {
        case 'failure':
            status = 'error';
            description = <>
                There was an error while attempting to complete your transaction.<br />
                Contact Wyre support for more information at support@sendwyre.com
            </>
            break;
        case 'success':
            localStorage.removeItem('shrub:buyMatic:reservationUrl');
            localStorage.removeItem('shrub:buyMatic:reservationDate');
            break;
        default:
            break;
    }
    // create an alert that will display a message on redirects according to the checkout status
    const defaultIsOpen = !!status;
    const { isOpen, onClose } = useDisclosure({ defaultIsOpen });
    return isOpen ? (
        <Center>
            <Box position={"fixed"} w={"auto"} top={20}>
                <Alert status={status} variant={"solid"}>
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Wyre Checkout</AlertTitle>
                        <AlertDescription>{description}</AlertDescription>
                    </Box>
                    <CloseButton
                        alignSelf='flex-start'
                        onClick={onClose}
                    />
                </Alert>
            </Box>
        </Center>
    ) : null;
}

export default WyreCheckoutStatus;
