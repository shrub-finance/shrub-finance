import React, { useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Flex,
  Spacer,
  Stack,
  HStack,
  VStack,
  Tag,
  Text,
  useDisclosure,
  useColorModeValue,
  Badge,
  Container,
  useBoolean,
} from "@chakra-ui/react";
function ProfitLossChart() {
  const optionRowTextColor = useColorModeValue("gray.600", "gray.200");
  const { isOpen, onOpen, onClose } = useDisclosure();
  // useEffect(()=>{
  // onOpen();
  // },[]);
  return (
    <>
      <h1>Hello</h1>
      {/* <Container
      cursor={"pointer"}
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
        bgGradient: useColorModeValue(
          "linear(to-r, sprout.200, teal.200)",
          "linear(to-l, blue.700, teal.700)"
        ),
      }}
      
      mt={1}
      wid
      flex="1"
      borderRadius="2xl"
      bg={useColorModeValue("white", "dark.100")}
      sx={{ userSelect: "none" }}
    >
      <Flex>
        <Box>
          <Text fontSize='md' borderBottom="1px solid">
            Long Call
          </Text>
        
        <HStack spacing={8} fontSize={"sm"} borderBottom="1px solid" mt={8}>
                <VStack spacing={2.5} alignItems={"flex-start"}>
                  <Text>$STRICK389 CALL</Text>
                  <Text>Total cost</Text>
                </VStack>
                <VStack
                  spacing={1.5}
                  alignItems={"flex-start"}
                  fontWeight={"600"}
                >
                  <Text>$pre.57</Text>
                  <Text>$0.57</Text>
                </VStack>
              </HStack>
              <VStack mt={8}>
                <Text>
                 Excepted Profit and Loss  
                </Text>   
                <Text>
                  Price on scale
                </Text>
              </VStack>
        </Box>
        </Flex> 
    </Container> */}
    </>
  );
}
export default ProfitLossChart;
