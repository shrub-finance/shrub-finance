import { isMobile } from "react-device-detect";
import {
  Box,
  Center,
  Container,
  Flex,
  Heading,
  Link,
  Spacer,
  Image,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { trackEvent } from "../utils/handleGATracking";
import { Link as ReachLink } from "@reach/router";
import { IMAGE_ASSETS } from "../utils/imageAssets";
import StatsBox from "./StatsBox";

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

      <Box maxW="60rem"  textAlign={"center"}>
        <Text pt="8">
          Oops ....  Error 404  : Page Not Found
        </Text>
      </Box> 
      
      <Flex
          direction={{ base: "column", md: "column", lg: "column", xl: "row" }}
        >
          <Box mt={{ base: 10, md: 16, lg: 16, xl: 24 }} mb={{base: 0, md:0, lg: 0, xl:0 }} >
            <Heading 
              fontSize={{ base: "30px", md: "81px" }}
              letterSpacing={"tight"}
         //   maxW={{ base: "20rem", md: "40rem" }}
              textAlign={{ base: "center", md: "center", lg:"left", xl: "left"}}
            >
              Lost in the <br />
              <Text
                as="span"
                background="gold.100"
                bgClip="text" 
              >
                Darkness
              </Text>{" "}
            </Heading>
          </Box>
          <Spacer />
          <Box
            mt={{ base: 10, md: 16, lg: 16, xl: 16}}
       //     ml={{ md: 30, lg: 80, xl: 0 }}
            display={{ base: "block", md: "block" }}
          >
              <Image
          //    width={{ base: "32rem", md: "42rem" }}
                src="https://shrub.finance/assets/lost-seeds.svg"
                fallbackSrc="https://shrub.finance/assets/lost-seeds.svg"
                alt=""
              />
          </Box>
</Flex>

<Text  
              fontSize={{ base: "10px", md: "24px" }}
              letterSpacing={"tight"}
             // maxW={{ base: "20rem", md: "40rem" }}
              textAlign={"center"}
              mt={{base:10, md:16, lg:16, xl:20}}
              mb={{base: 10, md:16, lg: 10, xl: 10 }}
              >
                Here are some of the pages that might interest you 
                </Text>

    <TableContainer>
      <Table>
        <Tbody>
          <Tr>
            <Td display={{ base: "table-cell", md: "table-cell"  }}>
            <Text as="span"
                background="gold.100"
                bgClip="text" >
                <a target="_blank" rel="noopener noreferrer" href="https://docs.shrub.finance/">Docs</a>
             </Text>
            </Td>
            <Td display={{ base: "table-cell", md: "table-cell" }}>
            <Text as="span"
                background="gold.100"
                bgClip="text" >
            <a target="_blank" rel="noopener noreferrer" href="https://paper.shrub.finance/">Shrub Paper</a>
            </Text>
            </Td>
            <Td display={{ base: "table-cell", md: "table-cell" }}>
            <Text as="span"
                background="gold.100"
                bgClip="text" >
            <a target="_blank" rel="noopener noreferrer" href="https://medium.com/@shrubfinance/shrub-roadmap-2022-b947b5ce1435">Roadmap 2022</a>
            </Text>
            </Td>
            
            <Td display={{ base: "table-cell", md: "table-cell"  }}>
            <Text as="span"
                background="gold.100"
                bgClip="text" >
                  <a target="_blank" rel="noopener noreferrer" href="https://exchange.shrub.finance/">Shrub Exchange</a>
                  </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>


</Container>
    )
    }
export default PageNotFound;