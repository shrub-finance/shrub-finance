import {
    Badge,
    Box,
    Heading,
    Text,
    Button,
    Center,
    useColorModeValue,
    Container, Flex, Spacer, Link
} from '@chakra-ui/react';
import {ArrowForwardIcon,} from '@chakra-ui/icons';
import {Link as ReachLink, RouteComponentProps} from '@reach/router';
import {PolygonIcon, ShrubLogo, UniIcon} from '../assets/Icons';
import {FaEthereum} from 'react-icons/fa';
import React from "react";


function HomeView(props: RouteComponentProps) {
    const property = {
        imageUrl: '../assets/uni.svg',
        imageAlt: "Uniswap insurance",
        beds: 80,
        baths: 2,
        title: "Buy ETH" +
            " for a 2%" +
            " discount ",
        formattedPrice: "$1,900.00",
        reviewCount: 34,
        rating: 4,
    }

    return (
        <>
            <Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center mt={20}>
                    <Box maxW="60rem" mb={12} textAlign={'center'}>
                        <Heading fontSize="60px" letterSpacing={"tight"} mb={4}>
                            Familiar with Options?
                        </Heading>
                        <Text fontSize="25px">
                            March ahead. Buy or sell options at your price, of your choosing!
                        </Text>
                        <Button
                            rightIcon={<ArrowForwardIcon/>}
                            size="lg"
                            px="50"
                            fontSize="25px"
                            py={10}
                            variant="solid"
                            mt="50px"
                            borderRadius="full"
                            bgGradient="linear(to-r,green.300,blue.400,#6666d2)"
                            _hover={{bgGradient:"linear(to-r,green.500,green.500,green.500)"}}
                            as={ReachLink} to={'/options'}
                        >
                            Start Trading
                        </Button>
                    </Box>
                </Center>
            </Container>

            <Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center mt={20}>
                    <Box maxW="60rem" mb={12} textAlign={'center'}>
                        <Heading fontSize="60px" letterSpacing={"tight"} mb={4}>
                            First time? Not sure what to buy?
                        </Heading>
                        <Text fontSize="25px">
                            Try these quick options
                        </Text>
                    </Box>
                </Center>

                <Flex
                    direction={{base: "column", md: "row", lg:"row"}}
                    alignItems={{base: "center", md: "center", lg:"center"}}
                >
                    <Box
                        mb={{ base: "10", md: "0", lg:"0" }}
                        maxW="xs"
                        mr={5}
                        shadow={useColorModeValue("2xl", "2xl")}
                        borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>
                        <Center mt={4}>
                            <UniIcon fontSize={180} fill="currentColor"/>
                        </Center>
                        <Box p="6">
                            <Box d="flex" alignItems="baseline">
                                <Badge borderRadius="full" px="2" colorScheme="teal">
                                    Put
                                </Badge>
                            </Box>

                            <Box
                                mt="1"
                                fontWeight="semibold"
                                as="h4"
                                lineHeight="tight"
                            >
                                Uniswap V3 LP Insurance
                            </Box>
                        </Box>
                    </Box>
                    <Spacer/>
                    <Box
                        mb={{ base: "10", md: "0", lg:"0" }}
                        mr={5}
                        maxW="xs" shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden"
                        bg={useColorModeValue("white", "shrub.100")}>
                        <Center mt={6}><PolygonIcon fontSize={160}/></Center>

                        <Box p="6">
                            <Box d="flex" alignItems="baseline">
                                <Badge borderRadius="full" px="2" colorScheme="purple">
                                    Call
                                </Badge>
                                <Badge borderRadius="full" px="2" colorScheme="red">
                                    Sell
                                </Badge>
                            </Box>

                            <Box
                                mt="1"
                                fontWeight="semibold"
                                as="h4"
                                lineHeight="tight"

                            >
                                Sell MATIC for a 4% discount
                            </Box>
                        </Box>
                    </Box>
                    <Spacer/>
                    <Box maxW="xs" shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden"
                         bg={useColorModeValue("white", "shrub.100")}>
                        <Center mt={4}> <FaEthereum fontSize={180}/></Center>

                        <Box p="6">
                            <Box d="flex" alignItems="baseline">
                                <Badge borderRadius="full" px="2" colorScheme="blue">
                                    Put
                                </Badge>
                                <Badge borderRadius="full" px="2" colorScheme="green">
                                    Buy
                                </Badge>
                            </Box>

                            <Box
                                mt="1"
                                fontWeight="semibold"
                                as="h4"
                                lineHeight="tight"

                            >
                                {property.title}
                            </Box>

                            {/*<Box>*/}
                            {/*    {property.formattedPrice}*/}
                            {/*    <Box as="span" color="gray.600" fontSize="sm">*/}
                            {/*        / call*/}
                            {/*    </Box>*/}
                            {/*</Box>*/}
                        </Box>
                    </Box>
                </Flex>
            </Container>
        </>
    )
}


export default HomeView