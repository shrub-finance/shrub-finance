import { useQuery, gql } from "@apollo/client";
import {
  useColorModeValue,
  Text,
  Spinner,
  Box,
  HStack,
  VStack,
} from "@chakra-ui/react";

import { RouteComponentProps } from "@reach/router";
import React, { useEffect } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TotalSeedsInTreasury,
  SeedsClaim,
  SeedsTypeTreasury,
} from "../constants/queries";
const RADIAN = Math.PI / 180;
let treasuryHopeSeeds: number;
let treasuryWonderSeeds: number;
let treasuryPassionSeeds: number;
let treasuryPowerSeeds: number;
let circulationPowerSeed: number;
let circulationWonderSeed: number;
let circulationHopeSeed: number;
let circulationPassionSeed: number;
let totalCirculationSeeds: number;

function ShrubSeedsPieChartView(props: RouteComponentProps) {
  const seedsType = ["Passion", "Hope", "Power"];
  const id = "0xbcfe78a91b6968322ed1b08fbe3a081353487910";

  const bg = useColorModeValue("sprout", "teal");
  const data1 = useQuery(TotalSeedsInTreasury);
  const claimedSeeds = useQuery(SeedsClaim);
  const totalSeedsShrubTeasury = data1?.data?.users[0]?.seedCount;
  for (let i = 0; i < seedsType.length; i++) {
    const data2 = useQuery(SeedsTypeTreasury, {
      variables: {
        id: "0xbcfe78a91b6968322ed1b08fbe3a081353487910",
        value: seedsType[i],
      },
    });
    if (data2.data) {
      switch (seedsType[i]) {
        case "Passion":
          treasuryPassionSeeds = data2.data.users[0].seeds.length;
          break;
        case "Hope":
          treasuryHopeSeeds = data2.data.users[0].seeds.length;
          break;
        case "Power":
          treasuryPowerSeeds = data2.data.users[0].seeds.length;
      }
    }
  }
  if (data1?.data?.users[0]?.seedCount) {
    const counter =
      treasuryHopeSeeds + treasuryPassionSeeds + treasuryPowerSeeds;
    treasuryWonderSeeds = totalSeedsShrubTeasury - counter;
  }

  if (claimedSeeds?.data?.typeStats?.length) {
    for (let i = 0; i < claimedSeeds.data.typeStats.length; i++) {
      switch (claimedSeeds.data.typeStats[i].id) {
        case "Passion":
          circulationPassionSeed =
            claimedSeeds.data.typeStats[i].claimed - treasuryPassionSeeds;
          break;

        case "Hope":
          circulationHopeSeed =
            claimedSeeds.data.typeStats[i].claimed - treasuryHopeSeeds;
          break;

        case "Power":
          circulationPowerSeed =
            claimedSeeds.data.typeStats[i].claimed - treasuryPowerSeeds;
          break;

        case "Wonder":
          circulationWonderSeed =
            claimedSeeds.data.typeStats[i].claimed - treasuryWonderSeeds;
          break;
      }
    }
    totalCirculationSeeds =
      circulationPassionSeed +
      circulationHopeSeed +
      circulationPowerSeed +
      circulationWonderSeed;
  }

  const data = [
    { name: "Passion", value: treasuryPassionSeeds },
    { name: "Hope", value: treasuryHopeSeeds },
    { name: "Power", value: treasuryPowerSeeds },
    { name: "Wonder", value: treasuryWonderSeeds },
  ];
  const color = ["#FF8042", "#0088FE", "#00C49F", "#FFBB28"];

  const data2 = [
    { name: "Passion", value: circulationPassionSeed },
    { name: "Hope", value: circulationHopeSeed },
    { name: "Power", value: circulationPowerSeed },
    { name: "Wonder", value: circulationWonderSeed },
  ];

  const data3 = [
    { name: "ShrubTreasury", value: 2334 },
    { name: "Ciculation Seeds", value: totalCirculationSeeds },
  ];
  const color2 = ["#FF8042", "#0088FE"];

  return (
    <>
      {totalCirculationSeeds && totalSeedsShrubTeasury ? (
        <HStack mt="10%">
          <Box width={400} height={400}>
            <VStack>
              <Text color="white"> Seeds In Shrub Treasury </Text>
              <PieChart width={400} height={400}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={0}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={color[index % color.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </VStack>
          </Box>
          <Box width={400} height={400}>
            <VStack>
              <Text color="white"> Seeds In Shrub Circulation </Text>
              <PieChart width={400} height={400}>
                <Pie
                  data={data2}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={0}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={color[index % color.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </VStack>
          </Box>
          <Box width={400} height={400}>
            <VStack>
              <Text color="white"> Seeds In Distribution </Text>
              <PieChart width={400} height={400}>
                <Pie
                  data={data3}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={color2[index % color2.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </VStack>
          </Box>
        </HStack>
      ) : (
        <Spinner />
      )}
    </>
  );
}

export default ShrubSeedsPieChartView;
