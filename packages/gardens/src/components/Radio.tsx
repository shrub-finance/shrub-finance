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
          fontWeight: "medium",
          color: useColorModeValue("white", "black"),
        }}
        _focus={{
          boxShadow: "outline",
        }}
        _hover={{
          transform: "translateY(-2px)",
        }}
        px={{ base: 4, md: 6 }}
        py={{ base: 2, md: 1 }}
        fontSize={{ base: "sm", md: "md" }}
        minWidth="50px"
        textAlign={"center"}
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default RadioCard;
