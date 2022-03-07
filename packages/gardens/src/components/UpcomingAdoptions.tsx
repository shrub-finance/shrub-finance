import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Link,
  Spinner,
  Tag,
  TagLabel,
  TagRightIcon,
  Wrap,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useLazyQuery } from "@apollo/client";
import { REGISTERED_SIBLINGS_QUERY } from "../constants/queries";

function UpcomingAdoptions({
  hooks,
}: {
  hooks: {
    adoptionRegister: any;
    seedOwnershipData: any;
    seedOwnershipLoading: any;
    isRegistered: any;
  };
}) {
  const [dnas, setDnas] = useState<number[]>([]);
  const [seedOwnershipDataRows, setSeedOwnershipDataRows] = useState<
    JSX.Element[]
  >([]);
  const {
    adoptionRegister,
    seedOwnershipData,
    seedOwnershipLoading,
    isRegistered,
  } = hooks;
  const [
    getRegisteredSiblingsQuery,
    {
      loading: registeredSiblingsLoading,
      error: registeredSiblingsError,
      data: registeredSiblingsData,
    },
  ] = useLazyQuery(REGISTERED_SIBLINGS_QUERY, {
    variables: {
      dnas: dnas,
      registered: adoptionRegister.map((a: any) => a.toLowerCase()),
    },
  });

  useEffect(() => {
    if (adoptionRegister && adoptionRegister.length && dnas && dnas.length) {
      getRegisteredSiblingsQuery();
    }
  }, [adoptionRegister, dnas]);

  useEffect(() => {
    if (
      seedOwnershipData &&
      seedOwnershipData.user &&
      seedOwnershipData.user.seeds
    ) {
      const tempDna: number[] = [];
      const tempSeedOwnershipDataRows: JSX.Element[] = [];
      const seedData = [...seedOwnershipData.user.seeds].sort(
        (a: any, b: any) => Number(a.id) - Number(b.id)
      );

      for (const item of seedData) {
        const { dna, type } = item;
        tempDna.push(dna);
        const dnaAccounts =
          registeredSiblingsData &&
          registeredSiblingsData.seeds.filter((s: any) => s.dna === dna).length;

        tempSeedOwnershipDataRows.push(
          <Flex
            layerStyle="shrubBg"
            boxShadow={"2xl"}
            rounded={"xl"}
            minW={{ base: "100px", md: "300px" }}
            maxW={"300px"}
            p={2}
          >
            <Box ml={2}>
              <Image
                boxSize={20}
                src={`https://shrub.finance/${type.toLowerCase()}-sad.svg`}
                alt="Seed"
              />
              <Badge
                px={2}
                py={0.5}
                layerStyle="shrubBg"
                fontWeight={"600"}
                fontSize={"11px"}
                rounded={"md"}
              >
                DNA {dna}
              </Badge>
            </Box>
            <Box p="4" borderRadius="lg">
              <Box
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                ml="2"
                mt={2}
              >
                {dnaAccounts} registered{" "}
                {dnaAccounts < 2 ? "account has" : "accounts have"} a seed with
                this DNA
              </Box>
              <Box display="flex" alignItems="baseline" mt={4} pt={2}>
                <Link
                  href={`https://opensea.io/collection/shrub-paper-gardens?search[numericTraits][0][name]=DNA&search[numericTraits][0][ranges][0][min]=${dna}&search[numericTraits][0][ranges][0][max]=${dna}&search[sortAscending]=true&search[sortBy]=PRICE`}
                  isExternal
                >
                  <Tag size={"sm"} variant="subtle" colorScheme="cyan">
                    <TagLabel>See matching DNAs</TagLabel>
                    <TagRightIcon boxSize="12px" as={ExternalLinkIcon} />
                  </Tag>
                </Link>
              </Box>
            </Box>
          </Flex>
        );
      }
      setDnas(tempDna);
      setSeedOwnershipDataRows(tempSeedOwnershipDataRows);
    }
  }, [seedOwnershipData, registeredSiblingsData]);

  return (
    <>
      <Box
        pt={!isRegistered ? 8 : 0}
        display={
          isRegistered ? "block" : { base: "none", md: "none", lg: "block" }
        }
      >
        <Center>
          <Heading fontSize="xl" pb={6} fontWeight={"medium"}>
            Up for Adoption
          </Heading>
        </Center>
        {seedOwnershipLoading ? (
          <Center>
            <Spinner size="xl" />
          </Center>
        ) : (
          <Wrap spacing="20px" justify="center">
            {" "}
            {seedOwnershipDataRows}
          </Wrap>
        )}
      </Box>
    </>
  );
}

export default UpcomingAdoptions;
