import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
  Center,
  Text,
  useDisclosure,
  SlideFade,
} from "@chakra-ui/react";
import React, { useEffect } from "react";

function WyreCheckoutStatus() {
  // look for a wyreCheckoutStatus query param in the url
  const currentURL = new URL(window.location.href);
  const currentURLParams = new URLSearchParams(currentURL.search);
  const wyreCheckoutStatus = currentURLParams.get("wyreCheckoutStatus");

  // create alert params based on wyreCheckoutStatus
  let description;
  let status: "error" | undefined;
  switch (wyreCheckoutStatus) {
    case "failure":
      status = "error";
      description = (
        <>
          <Text>
            There was an error while attempting to complete your transaction.
          </Text>
          <Text>
            Contact Wyre support for more information at support@sendwyre.com
          </Text>
        </>
      );
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
    <Center mt={20}>
      <SlideFade in={true} unmountOnExit={true}>
        <Alert status={status} borderRadius={9}>
          <AlertIcon />
          <Box>
            <AlertTitle>Wyre Checkout</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
          </Box>
          <CloseButton alignSelf="flex-start" onClick={onClose} />
        </Alert>
      </SlideFade>
    </Center>
  ) : null;
}

export default WyreCheckoutStatus;
