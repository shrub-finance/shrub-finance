import { isMobile } from "react-device-detect";
import {
  Box,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  Spacer,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";

function Roadmap(props: RouteComponentProps) {
  return (
    <Container
      mt={isMobile ? 30 : 50}
      p={5}
      flex="1"
      borderRadius="2xl"
      maxW="container.lg" >
      <Center mt={10} >
        <Box  maxW="container.lg" mb={8} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
            fontWeight={"bold"}
          >
            ROADMAP
          </Heading>

 {/* ******** THE PAPER MERCHANT  ****** */ }
<VStack mb={35}>
         <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} id="chapter1">
          <Text
            fontSize={{ base: "20px", md: "36px" }}
            fontWeight="semibold"
            color={useColorModeValue("gray.500", "gray.400")} >
            THE PAPER MERCHANT
          </Text>
        </Box>
            <Box maxW="60rem" mb={10} textAlign={"center"} pt={6}>
                <Text fontSize={{ base: "20px", md: "25px" }} fontWeight="">
                    Chapter 1 Complete
                </Text>
            </Box>
            <Center>
            <Box boxSize={60} pt={10}  >
                <Image src='https://shrub.finance/power.svg' alt='power'  />
            </Box>
            </Center>
            <Box maxW="60rem" mb={4} textAlign={"center"} pt={10}>
                <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                    Seed Claiming
                </Text>
            </Box>
            </VStack> 

{/* ********** THE SAD SEEDS   *******/ }
<VStack mb={35}>
            <Box maxW="60rem" mb={4} textAlign={"center"} mt={20} >
              <Text
                fontSize={{ base: "20px", md: "36px" }}
                fontWeight="semibold"
                color={useColorModeValue("gray.500", "gray.400")} >
                THE SAD SEEDS
              </Text>
            </Box>

            <Box maxW="60rem" mb={4} textAlign={"center"} pt={6}>
                <Text fontSize={{ base: "20px", md: "25px" }} >
                    Chapter 2 (Ongoing)
                </Text>
            </Box>
            <Center>
            <Image boxSize={60} pt={10} src='https://shrub.finance/passion.svg' alt='passion'  />
            </Center>
            <Box maxW="60rem" mb={4} textAlign={"center"} pt={10}>
              <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" >
                Adoption, Contests, Raffle
                </Text>
            </Box>
 </VStack>           
            

{/* ********** TIME TO GROW   *******/ } 
<VStack mb={35}>
  <Box maxW="container.lg">
  <Box mb={4} textAlign={"center"} mt={20} pt='10'>
    <Text
      fontSize={{ base: "20px", md: "36px" }}
      fontWeight="semibold"
      color={useColorModeValue("gray.500", "gray.400")}
    >
      TIME TO GROW
    </Text>
  </Box>
  <Box maxW="60rem" mb={4} textAlign={"center"} pt={6}>
    <Text fontSize={{ base: "20px", md: "25px" }} >
      Chapter 3 (Upcoming)
    </Text>
  </Box>
  <Box mb={10} mt={10} pt={10}>
    <Flex
      direction={{ base: "column", md: "row", lg: "row" }}
      alignItems={{ base: "center", md: "center", lg: "center" }} >
 {/* ************************* POT SALE block starts here  *************** */} 
       <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}   
        mr={5}
        ml={0}
        maxW="280px"
        minW="280px" >
        
        <Box p={6}>
          <Stack align={"center"}>
            <Image
               boxSize={40}
               src={`https://shrub.finance/static/media/pot.09c0ae74.svg`}
               alt="Seed" />
               <Heading pt={5} fontSize={"xl"} fontWeight={"500"}> Pot Sale </Heading>
          </Stack>
        </Box>
        </Box>
        <Spacer />
{/* ************************* PLANTING block starts here  *************** */} 
        <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={5}
        ml={0} >
        
        <Box p={6}>
          <Stack align={"center"}>
            <Image
               boxSize={40}
               src={`https://shrub.finance/static/media/plant.83b17524.svg`}
               alt="Seed" />
               <Heading pt={5} fontSize={"xl"} fontWeight={"500"}> Plant Your Seed </Heading>
          </Stack>
        </Box>
        </Box>
        <Spacer />       
{/* ************************* WATERING  block starts here  *************** */} 
        <Box
        
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={0}
         >
        
        <Box p={6}>
          <Stack align={"center"}>
            <Image
               boxSize={52}
               src={`https://shrub.finance/static/media/watering.ae4c3c3c.svg`}
               alt="Seed" />
               <Heading pt={5}  fontSize={"xl"} fontWeight={"500"} p='0' m='0'> Water Your Shrub</Heading>
          </Stack>
        </Box>
        </Box>
    </Flex>
  </Box>
</Box>
</VStack>
{/* ********** SHRUB PAPER  *******/ }
<VStack mb={35}>
<Box maxW="container.lg">
<Box mb={4} textAlign={"center"} mt={20} pt='10'>
    <Text
      fontSize={{ base: "20px", md: "36px" }}
      fontWeight="semibold"
      color={useColorModeValue("gray.500", "gray.400")} >
      SHRUB PAPER
    </Text>
</Box>
<Box maxW="60rem" mb={4} textAlign={"center"} pt={6}>
    <Text fontSize={{ base: "20px", md: "25px" }} fontWeight="">
      Chapter 4
    </Text>
</Box>

<Box mb={10} mt={10} pt={10}>
    <Flex
      direction={{ base: "column", md: "row", lg: "row" }}
      alignItems={{ base: "center", md: "center", lg: "center" }} >
 {/* ************************* trade options  *************** */} 
       <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}  
        mr={5}
        ml={0}
        maxW="280px"
        minW="280px" >
        
        <Box p={6}>
          <Stack align={"center"}>
            <Image
               boxSize={48}
               src={`https://shrub.finance/static/media/roll.90fa2ebe.svg`}
               alt="Seed" />
               <Heading pt={5}  fontSize={"xl"} fontWeight={"500"}> Trade Options with test tokens </Heading>
          </Stack>
        </Box>
        </Box>
        <Spacer />
{/* ************************* leaderboard  *************** */} 
        <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={5}
        ml={0} >
        
        <Box p={6}>
          <Stack align={"center"}>
            <Image
               boxSize={48}
               src={`https://shrub.finance/static/media/leaderboard.919d1f4a.svg`}
               alt="Seed" />
               <Heading pt={5} fontSize={"xl"} fontWeight={"500"}> Weekly Leaderboard </Heading>
          </Stack>
        </Box>
        </Box>
        <Spacer />       
{/* ************************* Fertilizer  *************** */} 
        <Box
        
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={0}
         >
        
        <Box p={6}>
          <Stack align={"center"}>
            <Image
               boxSize={48}
               src={`https://shrub.finance/static/media/fertilizer.f5fff6d8.svg`}
               alt="Seed" />
               <Heading pt={5} fontSize={"xl"} fontWeight={"500"} > Earn Fertilizer! </Heading>
          </Stack>
        </Box>
        </Box>
    </Flex>
  </Box>
  </Box>
</VStack>
{/* ********** ********** **********  PAPER DAO  ********** ********** *******/ }
<VStack mb={35}>
  <Box maxW="container.lg">
    <Box mb={4} textAlign={"center"} mt={20} pt='10'>
      <Text
      fontSize={{ base: "20px", md: "36px" }}
      fontWeight="semibold"
      color={useColorModeValue("gray.500", "gray.400")} >
      PAPER DAO
      </Text>
    </Box>
    <Box maxW="60rem" mb={4} textAlign={"center"} pt={6}>
      <Text fontSize={{ base: "20px", md: "25px" }} fontWeight="">
      Chapter 5
      </Text>
    </Box>

  <Box mb={10} mt={10} pt={10}>
    <Flex
      direction={{ base: "column", md: "row", lg: "row" }}
      alignItems={{ base: "center", md: "center", lg: "center" }} >
 {/* **************************************** */} 
       <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}  
        mr={5}
        ml={0}
        maxW="280px"
        minW="280px" >
        
        <Box p={6}>
          <Stack align={"center"}>
          <Image
               boxSize={48}
               src={`https://shrub.finance/static/media/dollar.e18cca2b.svg`}
               alt="Seed" />
               <Heading pt={5}  fontSize={"xl"} fontWeight={"500"}> Control over Paper DAO Treasury </Heading>
          </Stack>
        </Box>
        </Box>
        <Spacer />
 
        <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={5}
        ml={0} >
        
        <Box p={6}>
          <VStack align={"center"}>
          <Image
               boxSize={48}
               src={`https://shrub.finance/static/media/vote.344ee1b3.svg`}
               alt="Seed" />
            <Heading pt={5}  fontSize={"xl"} fontWeight={"500"}> Vote on next steps for Paper Gardens </Heading>
          </VStack>
        </Box>
        </Box>
        <Spacer />       

        <Box
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={0}
         >
        
        <Box p={6}>
          <Stack align={"center"}>
          <Image
               boxSize={48}
               src={`https://shrub.finance/static/media/spirals.b5af68fd.svg`}
               alt="Seed" />
               <Heading pt={5} fontSize={"xl"} fontWeight={"500"} > Decide what happens to lost seeds </Heading>
          </Stack>
        </Box>
        </Box>
    </Flex>
  </Box>
  
  <Box maxW="60rem" mb={4} textAlign={"center"} mt={20}>
    <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" color={useColorModeValue("gray.500", "gray.400")} >
      * Fully grown Shrubs grant entry into Paper DAO
    </Text>
  </Box>
  </Box>          
  </VStack>         

{/* **************************** SECRET PROJECT  *************************/ }
<VStack mb={35}>
<Box maxW="container.lg">
<Box mb={4} textAlign={"center"} mt={20} pt='10'>
    <Text
      fontSize={{ base: "20px", md: "36px" }}
      fontWeight="semibold"
      color={useColorModeValue("gray.500", "gray.400")} >
      SECRET PROJECT
    </Text>
</Box>
<Box mb={10} mt={10} pt={10}>
    <Flex
      direction={{ base: "column", md: "row", lg: "row" }}
      alignItems={{ base: "center", md: "center", lg: "center" }} >
 
       <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={5}
        ml={0} >
        
        <Box p={6}>
          <VStack align={"center"}>
          <Image
               boxSize={'230px'}
               src={`https://shrub.finance/static/media/mystery.9f3103bb.svg`}
               alt="Seed" />
               <Heading fontSize={"xl"} fontWeight={"500"}> New DeFi Project </Heading>
          </VStack>
        </Box>
        </Box>
        <Spacer />

        <Box
        mt={'auto'}
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={5}
        ml={0} >
        
        <Box p={6}>
          <VStack align={"center"}>
          <Image
               boxSize={'230px'}
               src={`https://shrub.finance/static/media/nfts.dcb435a3.svg`}
               alt="Seed" />
            <Heading fontSize={"xl"} fontWeight={"500"}> Ties NFTs and Options together </Heading>
          </VStack>
        </Box>
        </Box>
        <Spacer />       

        <Box
        
        mb={{ base: "10", md: "0", lg: "0" }}   
        maxW="280px"
        minW="280px"
        mr={0}
         >
        
        <Box p={6}>
          <Stack align={"center"}>
          <Image src='https://shrub.finance/static/media/smile.bae00358.svg' alt='pot sale' boxsize={16} />
               <Heading fontSize={"xl"} fontWeight={"500"} p='0' m='0'> Be the first to experience </Heading>
          </Stack>
        </Box>
        </Box>
    </Flex>
  </Box>
  
  <Box maxW="60rem" textAlign={"center"} mt={20}>
    <Text fontSize={{ base: "20px", md: "20px" }} fontWeight="semibold" color={useColorModeValue("gray.500", "gray.400")} >
      * Paper DAO members will have early access
    </Text>
  </Box>
  </Box>
  </VStack>
{/* ************************************************** */ }


</Box>
</Center>
</Container>
);
}

export default Roadmap;
