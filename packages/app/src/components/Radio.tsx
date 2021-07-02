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
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: useColorModeValue("teal.500", "teal.200"),
          fontWeight: "semibold",
          color: useColorModeValue("white", "gray.800")
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={8}
        py={1.5}
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default RadioCard;
