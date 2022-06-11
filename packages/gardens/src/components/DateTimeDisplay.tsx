import React from "react";
import { Box, Text } from "@chakra-ui/react";

const DateTimeDisplay = ({ value, type }: { value: number; type: string }) => {
  return (
    <Box>
      <Text>{value}</Text>
      <Text fontSize={{ base: "16px", md: "20px" }} pr={4}>
        {type}
      </Text>
    </Box>
  );
};

export default DateTimeDisplay;
