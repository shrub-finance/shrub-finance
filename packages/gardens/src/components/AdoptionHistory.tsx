import {
  Badge,
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Spinner,
  Tag,
  TagLabel,
  Wrap,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import useTruncateAddress from "../hooks/useTruncateAddress";

function AdoptionHistory({
  hooks,
}: {
  hooks: {
    seedAdoptionData: any;
    seedAdoptionLoading: any;
    isRegistered: any;
  };
}) {
  const { seedAdoptionData, seedAdoptionLoading, isRegistered } = hooks;
  const [seedAdoptionDataRows, setSeedAdoptionDataRows] = useState<
    JSX.Element[]
  >([]);

  useEffect(() => {
    if (seedAdoptionData && seedAdoptionData.adoptionRecords) {
      const tempSeedAdoptionRows: JSX.Element[] = [];
      for (const item of seedAdoptionData.adoptionRecords) {
        const { name, type } = item.seed;
        const adoptionTime = new Date(item.timestamp * 1000).toLocaleString(
          undefined,
          { year: "numeric", month: "long", day: "numeric" }
        );
        const owner = item.user.id;
        tempSeedAdoptionRows.push(
          <Flex
            mb={3}
            minW={{ base: "100px", md: "300px" }}
            maxW={"300px"}
            w={"full"}
            layerStyle="shrubBg"
            boxShadow={"2xl"}
            rounded={"xl"}
            p={2}
          >
            <Box ml={2} mt={5}>
              <Image
                boxSize={16}
                src={`https://shrub.finance/${type.toLowerCase()}-sad.svg`}
                alt="Seed"
              />
            </Box>
            <Box borderRadius="lg" py={4} minW={200}>
              <Box
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                ml="2"
              >
                {name}
              </Box>
              <Box letterSpacing="wide" ml="2" mt={4} fontSize="11px">
                <Badge
                  px={2}
                  py={1}
                  fontWeight={"600"}
                  colorScheme="orange"
                  rounded={"lg"}
                  fontSize="10px"
                >
                  Adopter: {useTruncateAddress(owner)}
                </Badge>
              </Box>
              <Box mt={2}>
                <Tag size="sm" variant="subtle" colorScheme="white">
                  <TagLabel>Adopted: {adoptionTime}</TagLabel>
                </Tag>
              </Box>
            </Box>
          </Flex>
        );
      }
      setSeedAdoptionDataRows(tempSeedAdoptionRows);
    }
  }, [seedAdoptionData]);
  return (
    <>
      <Box
        pt={8}
        display={
          isRegistered ? "block" : { base: "none", md: "none", lg: "block" }
        }
      >
        <Center>
          <Heading fontSize="xl" pb={6} fontWeight={"medium"}>
            Adoption History
          </Heading>
        </Center>
        {seedAdoptionLoading ? (
          <Center>
            {" "}
            <Spinner size="xl" />
          </Center>
        ) : (
          <Wrap spacing="20px" justify="center">
            {" "}
            {seedAdoptionDataRows}
          </Wrap>
        )}
      </Box>
    </>
  );
}

export default AdoptionHistory;
