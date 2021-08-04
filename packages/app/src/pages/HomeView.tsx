
import {
    Badge,
    Box,
    Image,
    Heading,
    Text,
    Button,
    Center,
    useColorModeValue,
    Container, Flex, Spacer
} from '@chakra-ui/react';
import {
    ArrowForwardIcon,
} from '@chakra-ui/icons';
import {RouteComponentProps} from '@reach/router';
import {
    HelloBud
} from '../assets/Icons';
import {FaEthereum} from 'react-icons/fa';

function HomeView(props: RouteComponentProps) {
    const property = {
        imageUrl: "https://app.uniswap.org/static/media/logo_white.811f9ef7.svg",
        // https://app.uniswap.org/static/media/logo.4a50b488.svg
        imageAlt: "Rear view of modern home with pool",
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


                <Center mt={20}>
                <Box
                    maxW="55rem"
                    mb={12}
                    textAlign={'center'}
                >
                    <Heading
                        fontSize="65px"
                        letterSpacing={"tight"}
                        mb={4}
                    >
                        {/*Defi Options for everyone*/}
                        A DeFi Options Platform that's all about <i>you</i>
                    </Heading>
                    <Text fontSize="25px">
                        Trade instantly. Trade freely
                        {/*No cut. No fee. Simply here to make <b>you</b> money.*/}
                    </Text>
                    <Button
                        rightIcon={<ArrowForwardIcon />}
                        size="lg"
                            px="50"
                        fontSize="25px"
                        py={10}
                        variant="solid"
                            mt="50px"
                        borderRadius="full"
                        bgGradient="linear(to-r,green.300,blue.400,#6666d2)"
                    >
                        Start trading
                    </Button>
                </Box>
                </Center>
            <Container
                mt={50}
                p={5}
                flex="1"
                borderRadius="2xl"
                maxW="container.lg"
            >
                <Text fontSize="25px" mb={8}
                      fontWeight='bold'
                >
                    Recipes fresh from the Shrub garden
                </Text>
                <Flex>
        <Box
            maxW="xs"
            mr={5}
            shadow={useColorModeValue("2xl", "2xl")}
            borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>
            <Center mt={4}><Image src={property.imageUrl} alt={property.imageAlt} boxSize={40}/></Center>
            <Box p="6">
                <Box d="flex" alignItems="baseline">
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                        Put
                    </Badge>
                    <Box
                        color="gray.500"
                        fontWeight="semibold"
                        letterSpacing="wide"
                        fontSize="xs"
                        textTransform="uppercase"
                        ml="2"
                    >
                        {property.beds}%
                    </Box>
                </Box>

                <Box
                    mt="1"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                >
                    Uniswap V3 LP Insurance
                </Box>

                <Box>
                    {property.formattedPrice}
                    <Box as="span" color="gray.600" fontSize="sm">
                        / call
                    </Box>
                </Box>
            </Box>
        </Box>
               <Spacer/>
                <Box
                    mr={5}
                    maxW="xs" shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>
                    <Center mt={6}><FaEthereum fontSize={160}/></Center>

                    <Box p="6">
                        <Box d="flex" alignItems="baseline">
                            <Badge borderRadius="full" px="2" colorScheme="teal">
                                Call
                            </Badge>
                            <Box
                                color="gray.500"
                                fontWeight="semibold"
                                letterSpacing="wide"
                                fontSize="xs"
                                textTransform="uppercase"
                                ml="2"
                            >
                                {property.beds}%
                            </Box>
                        </Box>

                        <Box
                            mt="1"
                            fontWeight="semibold"
                            as="h4"
                            lineHeight="tight"

                        >
                            {property.title}
                        </Box>

                        <Box>
                            {property.formattedPrice}
                            <Box as="span" color="gray.600" fontSize="sm">
                                / call
                            </Box>
                        </Box>
                    </Box>
                </Box>
                    <Spacer/>
                    <Box maxW="xs" shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>
                        <Center mt={4}> <HelloBud fontSize={180} style={{ filter:  "grayscale(100%)" }}/></Center>

                    <Box p="6">
                        <Box d="flex" alignItems="baseline">
                            <Badge borderRadius="full" px="2" colorScheme="teal">
                                Put
                            </Badge>
                            <Badge borderRadius="full" px="2" colorScheme="purple">
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

                        <Box>
                            {property.formattedPrice}
                            <Box as="span" color="gray.600" fontSize="sm">
                                / call
                            </Box>
                        </Box>
                    </Box>
                </Box>
                </Flex>
            </Container>
            <Container
                mt={50}
                p={5}
                flex="1"
                borderRadius="2xl"
                maxW="container.lg"
            >
                <Text fontSize="25px" mb={8}
                      fontWeight='bold'
                >
                    Bet with Bud.
                </Text>
                <Flex>
                    <Box
                        mr={5}
                        maxW="xs" shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>
                        <Center mt={6}><FaEthereum fontSize={160}/></Center>

                        <Box p="6">
                            <Box d="flex" alignItems="baseline">
                                <Badge borderRadius="full" px="2" colorScheme="teal">
                                    Call
                                </Badge>
                                <Box
                                    color="gray.500"
                                    fontWeight="semibold"
                                    letterSpacing="wide"
                                    fontSize="xs"
                                    textTransform="uppercase"
                                    ml="2"
                                >
                                    {property.beds}%
                                </Box>
                            </Box>

                            <Box
                                mt="1"
                                fontWeight="semibold"
                                as="h4"
                                lineHeight="tight"

                            >
                                I think it is going up
                            </Box>

                            <Box>
                                {property.formattedPrice}
                                <Box as="span" color="gray.600" fontSize="sm">
                                    / call
                                </Box>
                            </Box>
                        </Box>

                    </Box>

                </Flex>
            </Container>
        </>
    )
}


export default HomeView