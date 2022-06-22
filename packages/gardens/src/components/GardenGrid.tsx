import { Box, Image, Text, VStack } from "@chakra-ui/react";
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
  console.log(id, name);
  return (
    <Box
      as="button"
      key={id}
      shadow={"dark-lg"}
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
        <Box>
          <Image
            w={id === "fertilizer" ? 10 : id === "water" ? 16 : 20}
            h={20}
            src={imgCallback()}
          />
        </Box>
        <Text
          fontWeight={600}
          color="gray.500"
          fontSize={{ base: "sm", md: "1.5vw", lg: ".9vw" }}
        >
          {name}
        </Text>
      </VStack>
    </Box>
  );
}

export default GardenGrid;
