import { Box, Image, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import React from "react";

function GardenGrid({
  id,
  name,
  onClick,
  imgCallback,
}: {
  id: string;
  name: string;
  onClick: () => void;
  imgCallback: () => string;
}) {
  return (
    <Box
      as="button"
      key={id}
      shadow={useColorModeValue("md", "dark-lg")}
      borderRadius="md"
      minW={20}
      h={32}
      p={2}
      cursor="pointer"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
      }}
      _focus={{
        borderWidth: "2px",
        borderColor: "seed.600",
      }}
      onClick={onClick}
    >
      <VStack>
        <Box key={id}>
          <Image
            w={
              id === "fertilizer"
                ? 10
                : id === "water" || id === "pot"
                ? 16
                : 20
            }
            h={20}
            src={imgCallback()}
            cursor={"pointer"}
          />
        </Box>
        <Text
          fontWeight={600}
          color="gray.500"
          fontSize={{ base: "12px", md: "11px", lg: "12px", xl: "12px" }}
        >
          {name}
        </Text>
      </VStack>
    </Box>
  );
}

export default GardenGrid;
