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
import { isMobile } from "react-device-detect";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useLazyQuery } from "@apollo/client";
import {
  REGISTERED_SIBLINGS_QUERY,
  SEED_OWNERSHIP_QUERY,
} from "../constants/queries";
import { useWeb3React } from "@web3-react/core";

function UpcomingAdoptions({
  hooks,
}: {
  hooks: {
    adoptionRegister: any;
    seedOwnershipData: any;
    seedOwnershipLoading: any;
  };
}) {
  const [dnas, setDnas] = useState<number[]>([]);
  const [seedOwnershipDataRows, setSeedOwnershipDataRows] = useState<
    JSX.Element[]
  >([]);
  const { adoptionRegister, seedOwnershipData, seedOwnershipLoading } = hooks;
  const { account } = useWeb3React();

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
      for (const item of seedOwnershipData.user.seeds) {
        const { dna, type } = item;
        tempDna.push(dna);
        const dnaAccounts =
          registeredSiblingsData &&
          registeredSiblingsData.seeds.filter((s: any) => s.dna === dna).length;

        tempSeedOwnershipDataRows.push(
          <Flex
            mb={3}
            w={"full"}
            layerStyle="shrubBg"
            boxShadow={"2xl"}
            rounded={"xl"}
            // minW={{ base: "100px", md: "280px" }}
            maxW={"300px"}
          >
            <Box pt={4} pl={4}>
              <Image
                boxSize={isMobile ? 5 : 20}
                src={`https://shrub.finance/${type.toLowerCase()}-sad.svg`}
                alt="Seed"
              />
              <Badge
                px={2}
                py={1}
                layerStyle="shrubBg"
                fontWeight={"400"}
                fontSize={"11px"}
                rounded={"md"}
              >
                DNA {dna}
              </Badge>
            </Box>
            <Box p="6" borderRadius="lg">
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
              <Box display="flex" alignItems="baseline" mt={4}>
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
      {account && (
        <Box>
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
            <Wrap> {seedOwnershipDataRows}</Wrap>
          )}
        </Box>
      )}
    </>
  );
}

export default UpcomingAdoptions;
