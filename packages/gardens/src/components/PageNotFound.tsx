import { isMobile } from "react-device-detect";
import {
  Box,
  Center,
  Container,
  Heading,
} from "@chakra-ui/react";
import React from "react";
import { trackEvent } from "../utils/handleGATracking";
import { Link as ReachLink } from "@reach/router";

function PageNotFound() {
  function handleGA(event: any) {
    trackEvent({
      action: event.type,
      label: event.target.innerText,
    });
  }
  return (
    <Container
      mt={isMobile ? 30 : 50}
      p={5}
      flex="1"
      borderRadius="2xl"
      maxW="container.lg"
    >
      <Center h='600'>
        <Box maxW="60rem" mb={8} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
          >
            Error 404  : Page Not Found        
          </Heading>
        </Box>
      </Center>
    </Container>
  );
}

export default PageNotFound;
