import { isMobile } from "react-device-detect";
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Link,
  ListItem,
  Spacer,
  Stack,
  Text,
  UnorderedList,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { ArrowForwardIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import React from "react";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";

function Roadmap(props: RouteComponentProps) {
  return (
    <Container
      mt={isMobile ? 30 : 50}
      p={5}
      flex="1"
      borderRadius="2xl"
      maxW="container.lg"
    >
      <Center mt={10}>
        <Box maxW="60rem" mb={8} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
          >
            ROADMAP
          </Heading>

 {/* ******** THE PAPER MERCHANT  ****** */ }
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} id="chapter1">
                <Text
                    fontSize={{ base: "20px", md: "36px" }}
                    fontWeight="semibold"
                    color={useColorModeValue("gray.500", "gray.400")}
                >
                    THE PAPER MERCHANT
                </Text>
            </Box>

            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="">
                    Chapter 1 Complete
                </Text>
            </Box>
            <Center>
            <Box boxSize={40}  >
                <Image src='https://shrub.finance/power.svg' alt='power'  />
            </Box>
            </Center>
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                    Seed Claiming
                </Text>
            </Box>


{/* ********** THE SAD SEEDS   *******/ }
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} id="chapter1">
                <Text
              fontSize={{ base: "20px", md: "36px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
                >
                THE SAD SEEDS
                </Text>
            </Box>

            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="">
                    Chapter 2 (Ongoing)
                </Text>
            </Box>
            
            <Center>
                <Box boxSize={100}  >
                <Image src='https://shrub.finance/passion.svg' alt='passion'  />
            </Box>
            </Center>
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Adoption, Contests, Raffle
                </Text>
            </Box>

{/* ********** TIME TO GROW   *******/ } 
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} id="chapter1">
                <Text
              fontSize={{ base: "20px", md: "36px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
                >
                TIME TO GROW
                </Text>
            </Box>

            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="">
                Chapter 3 (Upcoming)
                </Text>
            </Box>
            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/pot.09c0ae74.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Pot Sale
                </Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='	https://shrub.finance/static/media/plant.83b17524.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Plant Your Seed
                </Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/watering.ae4c3c3c.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Water Your Shrub
                </Text>
            </Box>


{/* ********** SHRUB PAPER  *******/ }
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} id="chapter1">
                <Text
              fontSize={{ base: "20px", md: "36px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
                >
                SHRUB PAPER 
                </Text>
            </Box>

            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="">
                Chapter 4
                </Text>
            </Box>
            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/roll.90fa2ebe.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Trade Options with test tokens
                </Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/leaderboard.919d1f4a.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Weekly Leaderboard
                </Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/fertilizer.f5fff6d8.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Earn Fertilizer!
                </Text>
            </Box>


{/* ********** PAPER DAO  *******/ }
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} id="chapter1">
                <Text
              fontSize={{ base: "20px", md: "36px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
                >
                PAPER DAO
                </Text>
            </Box>

            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="">
                    Chapter 5
                </Text>
            </Box>
            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/dollar.e18cca2b.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Control over Paper DAO Treasury
</Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/vote.344ee1b3.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Vote on next steps for Paper Gardens


                </Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/spirals.b5af68fd.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Decide what happens to lost seeds
                
                </Text>
            </Box>
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" color={useColorModeValue("gray.500", "gray.400")} >
                * Fully grown Shrubs grant entry into Paper DAO
                
                </Text>
            </Box>

{/* ********** SECRET PROJECT  *******/ }
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} id="chapter1">
                <Text
              fontSize={{ base: "20px", md: "36px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
                >
                SECRET PROJECT
                </Text>
            </Box>

            
            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/mystery.9f3103bb.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                New DeFi Project
</Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/nfts.dcb435a3.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Ties NFTs and Options together



                </Text>
            </Box>

            <Center>
                <Box boxSize={40}  >
                    <Image src='https://shrub.finance/static/media/smile.bae00358.svg' alt='pot sale'  />
                </Box> 
                
            </Center>
            
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Be the first to experience
                
                </Text>
            </Box>
            
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" color={useColorModeValue("gray.500", "gray.400")} >
                * Paper DAO members will have early access
                </Text>
            </Box>
{/* ************************************************** */ }
<Box>
  
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} >
                <Text
              fontSize={{ base: "20px", md: "36px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
                >
                TIME TO GROW
                </Text>
                </Box>

            <Box maxW="60rem" mb={0} textAlign={"center"} mt={6}>
                <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="">
                Chapter 3 (Upcoming)
                </Text>
            </Box>
           
    <Center>
          <Box mb={10}>
            
            <Flex
              direction={{ base: "column", md: "row", lg: "row" }}
              alignItems={{ base: "center", md: "auto", lg: "auto" }}
            >
             
            {/* ************************* POT SALE block starts here  *************** */} 
                <Box
                mt={'auto'}
                  mb={{ base: "10", md: "0", lg: "0" }}
                  maxW="280px"
                  minW="280px"
                  mr={5}
                  shadow="2xl"
                //  bg='tomato'
                  borderRadius="2xl"
                  overflow="hidden"
                >
                  <Box p={6}>
                    
                    <Stack align={"center"}>
                      
                      <Image
               boxSize={'120px'}
             //  objectFit='cover'
                src={`https://shrub.finance/static/media/pot.09c0ae74.svg`}
                alt="Seed"
              />
                        <Text>Pot Sale</Text>
                   
                    </Stack>
                   
                  </Box>
                </Box>
             
              <Spacer />
                  {/* ************************* PLANTING block starts here  *************** */} 
                <Box
                mt={'auto'}
                  mb={{ base: "10", md: "0", lg: "0" }}
                  mr={5}
                  maxW="280px"
                  minW="280px"
                  shadow="2xl"
                  borderRadius="2xl"
                  overflow="hidden"
          //   bg='pink'
                >
                  <Box p={6}>
                    
                    <Stack align={"center"}>
                      <Image
                    boxSize={'120px'}
             
                src={`https://shrub.finance/static/media/plant.83b17524.svg`}
                alt="Seed"
              />
              <Heading fontSize={"xl"} fontWeight={"500"}>
              Plant Your Seed
                      </Heading>
                      
                    </Stack>
                  
                  </Box>
                </Box>

              <Spacer />
    {/* ************************* WATERING  block starts here  *************** */} 
              <Box
                  mb={{ base: "10", md: "0", lg: "0" }}
                  mr={5}
                  maxW="280px"
                  minW="280px"
                  shadow="2xl"
                  borderRadius="2xl"
                  overflow="hidden"
           //       bg='blue'
                >
                  <Box p={6}>
                    <Stack align={"center"}>
                       <Image
                 boxSize={'220px'}
                src={`https://shrub.finance/static/media/watering.ae4c3c3c.svg`}
                alt="Seed"
              />
              <Heading fontSize={"xl"} fontWeight={"500"} p='0' m='0'>
              Water Your Shrub
                      </Heading>
                    </Stack>
                  
                  </Box>
                </Box>


                    {/* ************************* BLUE block ends here  *************** */} 


            </Flex>
          </Box>
        </Center>
      

</Box>

        </Box>
      </Center>
    </Container>
  );
}

export default Roadmap;
