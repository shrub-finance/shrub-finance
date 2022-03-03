import {
  Badge,
  Box,
  Center,
  Heading,
  Image,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import React from "react";

function SeedDetails({
  hooks,
}: {
  hooks: {
    mySeedDataLoading: any;
    mySeedDataError: any;
    selectedItem: any;
  };
}) {
  const { mySeedDataLoading, mySeedDataError, selectedItem } = hooks;
  return (
    <Box minW={{ base: "290", md: "400" }} maxH="614px">
      {mySeedDataLoading || mySeedDataError ? (
        <Center p={10}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box
          w={"full"}
          layerStyle="shrubBg"
          boxShadow={"2xl"}
          rounded={"xl"}
          p={4}
        >
          {/*image*/}
          <Center mt={{ base: "6", md: "0" }}>
            <Image
              objectFit={"cover"}
              maxH={{ base: "300px", md: "450px" }}
              src={
                selectedItem.emotion === "sad"
                  ? `https://shrub.finance/${selectedItem.type.toLowerCase()}-sad.svg`
                  : `https://shrub.finance/${selectedItem.type.toLowerCase()}.svg`
              }
              alt="Seed"
            />
          </Center>
          {/*title*/}
          <Center mt={6}>
            <Heading fontSize={{ base: "lg", md: "2xl" }}>
              {selectedItem.name}
            </Heading>
          </Center>
          <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
            <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
              Rarity:{" "}
              {selectedItem.type === "Hope"
                ? "Rare"
                : selectedItem.type === "Power"
                ? "Legendary"
                : selectedItem.type === "Passion"
                ? "Uncommon"
                : "Common"}
            </Badge>
            <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
              Emotion: {selectedItem.emotion}
            </Badge>
          </Stack>
          <Stack align={"center"} justify={"center"} direction={"row"} mt={2}>
            <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
              Class: {selectedItem.type}
            </Badge>
            <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
              DNA: {selectedItem.dna}
            </Badge>
          </Stack>

          {/*<Stack mt={8} direction={"row"} spacing={4}>*/}
          {/*  <Button*/}
          {/*    flex={1}*/}
          {/*    fontSize={"sm"}*/}
          {/*    rounded={"full"}*/}
          {/*    _focus={{*/}
          {/*      bg: "gray.200",*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    Action A*/}
          {/*  </Button>*/}
          {/*  <Button*/}
          {/*    flex={1}*/}
          {/*    fontSize={"sm"}*/}
          {/*    rounded={"full"}*/}
          {/*    bg={"blue.400"}*/}
          {/*    color={"white"}*/}
          {/*    boxShadow={*/}
          {/*      "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"*/}
          {/*    }*/}
          {/*    _hover={{*/}
          {/*      bg: "blue.500",*/}
          {/*    }}*/}
          {/*    _focus={{*/}
          {/*      bg: "blue.500",*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    Plant*/}
          {/*  </Button>*/}
          {/*</Stack>*/}
        </Box>
      )}
    </Box>
  );
}

export default SeedDetails;
