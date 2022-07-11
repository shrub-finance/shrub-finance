import { Box, HStack, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";

function StatsBox({
  name,
  amount,
  imgSrc,
  isLoading,
}: {
  name: string;
  amount: number;
  imgSrc: string;
  isLoading: boolean;
}) {
  return (
    <HStack>
      {name.includes("Wonder") ||
      name.includes("Power") ||
      name.includes("Hope") ||
      name.includes("Passion") ? (
        <Image boxSize={16} src={imgSrc} />
      ) : name.includes("Seeds") ? (
        ""
      ) : name.includes("Empty Pot") ? (
        <Image src={imgSrc} boxSize={14} />
      ) : (
        <Image src={imgSrc} boxSize={24} />
      )}

      <VStack>
        <Text fontSize={"lg"}>{name}</Text>
        {isLoading ? <Spinner /> : <Text fontSize={"3xl"}>{amount}</Text>}
      </VStack>
    </HStack>
  );
}

export default StatsBox;
