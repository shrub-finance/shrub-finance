
import {Box, Badge, useColorModeValue, Container} from "@chakra-ui/react";
import { IoCheckmarkDoneCircleOutline, IoCheckmarkDoneCircleSharp } from "react-icons/io5";

function TxMonitoring() {
    const property = {
        beds: 3,
        baths: 2,
        title: "PENDING",
        formattedPrice: "$1,900.00",
        reviewCount: 34,
        rating: 4,
    }

    return (
        <Container
            mt={50}
            p={0}
            flex="1"
            borderRadius="2xl"
            fontFamily="Montserrat"
            bg={useColorModeValue("white", "rgb(31, 31, 65)")}
            shadow={useColorModeValue("2xl", "2xl")}
            maxW="container.md"
        >
        <Box maxW="sm"  borderRadius="lg" overflow="hidden">
            <Box p="6">
                <Box d="flex" alignItems="baseline">
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                        New
                    </Badge>
                    <Box
                        color="green.500"
                        fontWeight="extrabold"
                        fontSize="2xl"
                        ml="2"
                    >
                        <IoCheckmarkDoneCircleOutline/>
                    </Box>
                </Box>

                <Box
                    mt="1"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                    isTruncated
                >
                    {property.title}
                </Box>

                <Box>
                    {/*{property.formattedPrice}*/}
                    {/*<Box as="span" color="gray.600" fontSize="sm">*/}
                    {/*    / wk*/}
                    {/*</Box>*/}
                </Box>


            </Box>
        </Box>
</Container>
    )
}

export default TxMonitoring;