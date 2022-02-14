import {
  Badge,
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Spacer,
  Spinner,
  Wrap,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import useTruncateAddress from "../hooks/useTruncateAddress";
import { useWeb3React } from "@web3-react/core";
import { isMobile } from "react-device-detect";

function AdoptionHistory({
  hooks,
}: {
  hooks: {
    seedAdoptionData: any;
    seedAdoptionLoading: any;
  };
}) {
  const { account } = useWeb3React();
  const { seedAdoptionData, seedAdoptionLoading } = hooks;
  const [seedAdoptionDataRows, setSeedAdoptionDataRows] = useState<
    JSX.Element[]
  >([]);

  useEffect(() => {
    if (seedAdoptionData && seedAdoptionData.adoptionRecords) {
      const tempSeedAdoptionRows: JSX.Element[] = [];
      for (const item of seedAdoptionData.adoptionRecords) {
        const { name, type, dna } = item.seed;
        const adoptionTime = new Date(item.timestamp * 1000).toLocaleString(
          undefined,
          { year: "numeric", month: "long", day: "numeric" }
        );
        const owner = item.user.id;
        tempSeedAdoptionRows.push(
          <Flex
            mb={3}
            minW={{ base: "100px", md: "280px" }}
            maxW={"250px"}
            w={"full"}
            layerStyle="shrubBg"
            boxShadow={"2xl"}
            rounded={"xl"}
          >
            <Box pt={4} pl={4}>
              <Image
                boxSize={isMobile ? 5 : 20}
                src={`https://shrub.finance/${type.toLowerCase()}-sad.svg`}
                alt="Seed"
              />
            </Box>
            <Box borderRadius="lg" p="6">
              <Box
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                ml="2"
              >
                {name}
              </Box>
              <Box letterSpacing="wide" ml="2" mt={4} fontSize="11px">
                Adopter: <strong>{useTruncateAddress(owner)}</strong>
              </Box>
              <Box mt={2}>
                <Box letterSpacing="wide" fontSize="11px" ml="2">
                  Adopted: <strong>{adoptionTime}</strong>
                </Box>
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
      {account && (
        <Box>
          <Center>
            <Heading fontSize="xl" pb={6} fontWeight={"medium"} minW={200}>
              Adoption History
            </Heading>
          </Center>
          {seedAdoptionLoading ? (
            <Center>
              {" "}
              <Spinner size="xl" />
            </Center>
          ) : (
            <Wrap> {seedAdoptionDataRows}</Wrap>
          )}
        </Box>
      )}
    </>
  );
}

export default AdoptionHistory;
