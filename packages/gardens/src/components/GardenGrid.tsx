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
  onClick: () => any;
  imgCallback: () => string;
}) {
  console.log(id, name);
  return (
    <Box
      as="button"
      key={id}
      // shadow={btnShadow}
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
          <Image w={20} h={20} src={imgCallback()} alt="Seed" />
        </Box>
        <Text fontWeight={600} color="gray.500" fontSize="sm">
          {name}
        </Text>
      </VStack>
    </Box>
  );
}

export default GardenGrid;
