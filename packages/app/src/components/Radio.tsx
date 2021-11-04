import {Box, useColorModeValue, useRadio} from "@chakra-ui/react";

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
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={useColorModeValue("green.500", "gray.700")}
        boxShadow="md"
        sx={{userSelect:'none'}}
        _checked={{
          bg: useColorModeValue("green.500", "gray.400"),
          fontWeight: "semibold",
          color: useColorModeValue("white", "black")
        }}
        _focus={{
          boxShadow: "outline",
        }}
        _hover={{
            borderColor: useColorModeValue("green.500", "gray.400"),
            borderWidth: "1px"
        }}
        px={{ base: 2, md: 8 }}
        py={{ base: 1, md: 1.5 }}
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default RadioCard;
