import React from "react";
import { Box, Text } from "@chakra-ui/react";

// @ts-ignore
const DateTimeDisplay = ({ value, type }) => {
  return (
    <Box>
      <Text>{value}</Text>
      <Text fontSize={{ base: "10px", md: "20px" }} px={4}>
        {type}
      </Text>
    </Box>
  );
};

export default DateTimeDisplay;
