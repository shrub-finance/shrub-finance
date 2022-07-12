import {
  Box,
  Center,
  Grid,
  GridItem,
  HStack,
  Image,
  Spinner,
  VStack,
  Text,
  TableContainer,
  Table,
  Th,
  Tfoot,
  Tbody,
  TableCaption,
  Thead,
  Tr,
  Td,
  Heading,
} from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { GARDENS_STATS_QUERY } from "../constants/queries";
import React, { useEffect, useState } from "react";
import { IMAGE_ASSETS } from "../utils/imageAssets";
import StatsBox from "./StatsBox";
import GrowthLeadBox from "./GrowthLeadBox";

function GardenStats() {
  const {
    loading: gardenStatsLoading,
    error: gardenStatsError,
    data: gardenStatsData,
  } = useQuery(GARDENS_STATS_QUERY, {
    variables: {},
  });

  const [growthLeadBoardRows, setGrowthLeadBoardRows] = useState<JSX.Element[]>(
    []
  );

  useEffect(() => {
    console.debug("useEffect gardenStats");
    console.log(gardenStatsData);
    if (!gardenStatsData) {
      return;
    }
    const tempGrowthLeadBoardRows: JSX.Element[] = [];
    if (!gardenStatsData.pottedPlants) {
      console.error("no pottedPlants in data");
      return;
    }
    let i = 0;
    for (const item of gardenStatsData.pottedPlants) {
      i++;
      const uri = item.uri;
      const owner = item.owner.id;
      const growth = item.growth;
      if (i > 20) {
        break;
      }
      tempGrowthLeadBoardRows.push(
        <GrowthLeadBox
          base64Uri={uri}
          position={i}
          owner={owner}
          growth={growth}
          loading={gardenStatsLoading}
        />
      );
    }
    setGrowthLeadBoardRows(tempGrowthLeadBoardRows);
  }, [gardenStatsData]);

  useEffect(() => {
    if (!gardenStatsError) {
      return;
    }
    console.log(gardenStatsError);
  }, [gardenStatsError]);

  function getTypeCount(type: string, property: string) {
    if (!gardenStatsData || !gardenStatsData.typeStats) {
      return;
    }
    const typeStat = gardenStatsData.typeStats.find((t: any) => t.id === type);
    if (!typeStat) {
      return;
    }
    return typeStat[property];
  }

  function getSeedCount(type: string) {
    return getTypeCount(type, "circulation");
  }

  function getPotCount(type: string) {
    const planted = getTypeCount(type, "planted");
    const harvested = getTypeCount(type, "harvested");
    if (isNaN(planted) || isNaN(harvested)) {
      return 0;
    }
    return planted - harvested;
  }

  function getTotalPlanted() {
    const planted1 = getTypeCount("Wonder", "planted");
    const planted2 = getTypeCount("Passion", "planted");
    const planted3 = getTypeCount("Hope", "planted");
    const planted4 = getTypeCount("Power", "planted");
    if (
      isNaN(planted1) ||
      isNaN(planted2) ||
      isNaN(planted3) ||
      isNaN(planted4)
    ) {
      return 0;
    }
    return planted1 + planted2 + planted3 + planted4;
  }

  function seedsInCirculation() {
    return (
      gardenStatsData &&
      gardenStatsData.typeStats &&
      gardenStatsData.typeStats.reduce(
        (t: number, v: { circulation: number }) => t + v.circulation,
        0
      )
    );
  }

  function potsInCirculation() {
    return (
      gardenStatsData &&
      gardenStatsData.users &&
      gardenStatsData.users.reduce(
        (t: number, v: { potCount: string }) => t + Number(v.potCount),
        0
      )
    );
  }

  return (
    <>
      <Center mt={12}>
        <Heading
          fontSize={{ base: "30px", md: "50px" }}
          letterSpacing={"tight"}
          textAlign={"center"}
          maxW="60rem"
          mb={{ base: 8, md: 14 }}
        >
          Garden Stats
        </Heading>
      </Center>
      <TableContainer mb={12}>
        <Table>
          <TableCaption>
            <Text fontSize={"md"}>Total Planted: {getTotalPlanted()}</Text>
          </TableCaption>
          <Tbody>
            <Tr>
              <Td>
                <StatsBox
                  name={"Seeds in Circulation"}
                  amount={seedsInCirculation()}
                  imgSrc={""}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={"Wonder"}
                  amount={getSeedCount("Wonder")}
                  imgSrc={IMAGE_ASSETS.seeds.Wonder.happy}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={"Passion"}
                  amount={getSeedCount("Passion")}
                  imgSrc={IMAGE_ASSETS.seeds.Passion.happy}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={"Hope"}
                  amount={getSeedCount("Hope")}
                  imgSrc={IMAGE_ASSETS.seeds.Hope.happy}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={"Power"}
                  amount={getSeedCount("Power")}
                  imgSrc={IMAGE_ASSETS.seeds.Power.happy}
                  isLoading={gardenStatsLoading}
                />
              </Td>
            </Tr>
            <Tr>
              <Td>
                <StatsBox
                  name={"Empty Pots"}
                  amount={potsInCirculation()}
                  imgSrc={IMAGE_ASSETS.emptyPot}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={""}
                  amount={getPotCount("Wonder")}
                  imgSrc={IMAGE_ASSETS.getPottedPlant("Wonder", 0, "happy")}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={""}
                  amount={getPotCount("Passion")}
                  imgSrc={IMAGE_ASSETS.getPottedPlant("Passion", 0, "happy")}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={""}
                  amount={getPotCount("Hope")}
                  imgSrc={IMAGE_ASSETS.getPottedPlant("Hope", 0, "happy")}
                  isLoading={gardenStatsLoading}
                />
              </Td>
              <Td>
                <StatsBox
                  name={""}
                  amount={getPotCount("Power")}
                  imgSrc={IMAGE_ASSETS.getPottedPlant("Power", 0, "happy")}
                  isLoading={gardenStatsLoading}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <Center>
        <Heading
          fontSize={{ base: "30px", md: "50px" }}
          letterSpacing={"tight"}
          textAlign={"center"}
          maxW="60rem"
          mb={{ base: 8, md: 14 }}
        >
          Growth Leaderboard
        </Heading>
      </Center>
      <Center>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th display={{ base: "none", md: "block" }}>Number</Th>
              <Th>Type</Th>
              <Th>Growth</Th>
              <Th>Owner</Th>
            </Tr>
          </Thead>
          <Tbody>
            {gardenStatsLoading ? (
              <Tr>
                <Td display={{ base: "none", md: "block" }}>
                  <Spinner size="xs" />
                </Td>
                <Td>
                  <Spinner size="xs" />
                </Td>
                <Td>
                  <Spinner size="xs" />
                </Td>
                <Td>
                  <Spinner size="xs" />
                </Td>
              </Tr>
            ) : (
              growthLeadBoardRows
            )}
          </Tbody>
        </Table>
      </Center>
    </>
  );
}

export default GardenStats;
