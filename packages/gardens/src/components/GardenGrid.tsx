import {
  Badge,
  Box,
  Icon,
  Image,
  keyframes,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { WateringCan } from "../assets/Icons";

function GardenGrid({
  id,
  name,
  onClick,
  imgCallback,
  category,
}: {
  id: string;
  name: string;
  onClick: () => void;
  imgCallback: () => string;
  category?: string;
}) {
  const shadow = useColorModeValue("md", "dark-lg");

  return (
    <Box
      as="button"
      key={id}
      shadow={shadow}
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
      <VStack position="relative">
        <Tooltip
          hasArrow
          label={"Water is available for your plant now!"}
          shouldWrapChildren
          mt="3"
        >
          <Icon
            as={WateringCan}
            w={5}
            h={5}
            position={"absolute"}
            right={0}
            top={0}
          />
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
              transform={category === "pottedPlant" ? "scale(1.5)" : undefined}
            />
          </Box>
        </Tooltip>
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
