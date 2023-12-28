import { isMobile } from "react-device-detect";
import {
  Box,
  Container,
  Flex,
  Heading,
  Spacer,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  useColorMode,
  Link,
} from "@chakra-ui/react";
import React from "react";
import { trackEvent } from "../utils/handleGATracking";

function PageNotFound() {
  const { colorMode } = useColorMode();

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
      <Box maxW="60rem" textAlign={"center"}>
        <Text pt="8">Oops .... Page Not Found</Text>
      </Box>

      <Flex
        direction={{ base: "column", md: "column", lg: "column", xl: "row" }}
      >
        <Box
          mt={{ base: 10, md: 16, lg: 16, xl: 24 }}
          mb={{ base: 0, md: 0, lg: 0, xl: 0 }}
        >
          <Heading
            fontSize={{ base: "30px", md: "81px" }}
            letterSpacing={"tight"}
            mr={{ base: 0, md: 0, lg: 0, xl: 30 }}
            textAlign={{ base: "center", md: "center", lg: "left", xl: "left" }}
          >
            Lost in the <br />
            <Text
              as="span"
              background="gold.100"
              bgClip="text"
              sx={{
                WebkitTextStroke:
                  colorMode === "light"
                    ? { base: "1px #7e5807", md: "2px #7e5807" }
                    : "transparent",
              }}
            >
              Darkness
            </Text>{" "}
          </Heading>
        </Box>
        <Spacer />
        <Box
          mt={{ base: 10, md: 16, lg: 16, xl: 16 }}
          display={{ base: "block", md: "block" }}
        >
          <Image
            src="https://shrub.finance/assets/lost-seeds.svg"
            fallbackSrc="https://shrub.finance/assets/lost-seeds.svg"
            alt="404 page image"
            rounded={"lg"}
          />
        </Box>
      </Flex>

      {/*<Text*/}
      {/*  fontSize={{ base: "10px", md: "24px" }}*/}
      {/*  letterSpacing={"tight"}*/}
      {/*  textAlign={"center"}*/}
      {/*  mt={{ base: 10, md: 16, lg: 16, xl: 20 }}*/}
      {/*  mb={{ base: 10, md: 16, lg: 10, xl: 10 }}*/}
      {/*>*/}
      {/*  Here are some pages that might interest you*/}
      {/*</Text>*/}

      {/*<TableContainer>*/}
      {/*  <Table>*/}
      {/*    <Tbody>*/}
      {/*      <Tr>*/}
      {/*        <Td display={{ base: "table-cell", md: "table-cell" }}>*/}
      {/*          <Link*/}
      {/*            href="https://exchange.shrub.finance/"*/}
      {/*            isExternal*/}
      {/*            background="gold.100"*/}
      {/*            bgClip="text"*/}
      {/*            sx={{*/}
      {/*              WebkitTextStroke:*/}
      {/*                colorMode === "light"*/}
      {/*                  ? { base: "1px #7e5807", md: "1px #7e5807" }*/}
      {/*                  : "transparent",*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            Shrub Exchange*/}
      {/*          </Link>*/}
      {/*        </Td>*/}
      {/*        <Td display={{ base: "table-cell", md: "table-cell" }}>*/}
      {/*          <Link*/}
      {/*            href="https://medium.com/@shrubfinance/shrub-roadmap-2022-b947b5ce1435"*/}
      {/*            isExternal*/}
      {/*            background="gold.100"*/}
      {/*            bgClip="text"*/}
      {/*            sx={{*/}
      {/*              WebkitTextStroke:*/}
      {/*                colorMode === "light"*/}
      {/*                  ? { base: "1px #7e5807", md: "1px #7e5807" }*/}
      {/*                  : "transparent",*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            Roadmap 2022*/}
      {/*          </Link>*/}
      {/*        </Td>*/}
      {/*        <Td display={{ base: "table-cell", md: "table-cell" }}>*/}
      {/*          <Link*/}
      {/*            href="https://docs.shrub.finance/"*/}
      {/*            isExternal*/}
      {/*            background="gold.100"*/}
      {/*            bgClip="text"*/}
      {/*            sx={{*/}
      {/*              WebkitTextStroke:*/}
      {/*                colorMode === "light"*/}
      {/*                  ? { base: "1px #7e5807", md: "1px #7e5807" }*/}
      {/*                  : "transparent",*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            Docs*/}
      {/*          </Link>*/}
      {/*        </Td>*/}
      {/*        <Td display={{ base: "table-cell", md: "table-cell" }}>*/}
      {/*          <Link*/}
      {/*            href="https://shrub.finance"*/}
      {/*            isExternal*/}
      {/*            background="gold.100"*/}
      {/*            bgClip="text"*/}
      {/*            sx={{*/}
      {/*              WebkitTextStroke:*/}
      {/*                colorMode === "light"*/}
      {/*                  ? { base: "1px #7e5807", md: "1px #7e5807" }*/}
      {/*                  : "transparent",*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            Shrub Main*/}
      {/*          </Link>*/}
      {/*        </Td>*/}
      {/*      </Tr>*/}
      {/*    </Tbody>*/}
      {/*  </Table>*/}
      {/*</TableContainer>*/}
    </Container>
  );
}
export default PageNotFound;
