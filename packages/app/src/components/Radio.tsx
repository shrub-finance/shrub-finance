import { Box, useColorModeValue, useRadio } from "@chakra-ui/react";

// @ts-ignore
function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        rounded="2xl"
        borderWidth="1px"
        borderColor={useColorModeValue("sprout.500", "gray.700")}
        boxShadow="lg"
        sx={{ userSelect: "none" }}
        _checked={{
          bg: useColorModeValue("sprout.500", "teal.200"),
          // bgGradient:"linear(to-r,green.300,blue.400,#6666d2)",
          fontWeight: "semibold",
          color: useColorModeValue("white", "black"),
        }}
        _focus={{
          boxShadow: "outline",
        }}
        // bgGradient="linear(to-r,green.300,blue.400,#6666d2)"
        // _hover={{bgGradient:"linear(to-r,green.300,blue.600,blue.400)"}}
        _hover={{
          // borderColor: useColorModeValue("green.500", "gray.400"),
          // borderWidth: "1px",
          transform: "translateY(-2px)",
        }}
        px={{ base: 4, md: 6 }}
        py={{ base: 2, md: 1 }}
        fontSize={{ base: "sm", md: "md" }}
        minWidth="50px"
        textAlign={"center"}
        // bg={useColorModeValue("white", "hsl(240deg 89% 7%)")}
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default RadioCard;
