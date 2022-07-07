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
      <Box>
        <Image w={10} src={imgSrc} />
      </Box>
      <Box>
        <VStack>
          <Text fontSize={"lg"}>{name}</Text>
          {isLoading ? <Spinner /> : <Text fontSize={"3xl"}>{amount}</Text>}
        </VStack>
      </Box>
    </HStack>
  );
}

export default StatsBox;
