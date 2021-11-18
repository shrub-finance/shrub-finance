import React, {useState} from "react";

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
  Tag,
  Text,
  useDisclosure, useColorModeValue, Badge, Container
} from "@chakra-ui/react";

import {AppCommon, OptionData, SellBuy} from '../types';
import OptionDetails from "./OptionDetails";
import {Txmonitor} from "./TxMonitoring";
import {currencySymbol} from "../utils/chainMethods";
import {useWeb3React} from "@web3-react/core";
import usePriceFeed from "../hooks/usePriceFeed";
import {CHAINLINK_MATIC} from "../constants/chainLinkPrices";
import {isMobile} from "react-device-detect";


function OptionRow({appCommon, last, ask, bid, option, optionData, positionHash}: {
  appCommon: AppCommon,
  last: string,
  ask: string,
  bid: string,
  positionHash: string,
  option: SellBuy,
  optionData: OptionData
}) {
  const { optionType, formattedStrike } = appCommon;
  const { isOpen, onOpen, onClose} = useDisclosure();
  const [approving, setApproving] = React.useState(false);
  const [activeHash, setActiveHash] = useState<string>();
  const {chainId} = useWeb3React();
  const { price: maticPrice } = usePriceFeed(CHAINLINK_MATIC);

  const bg = useColorModeValue("sprout", "teal");
  const livePriceColor = useColorModeValue("green.500", "green.200")
  const optionRowTextColor = useColorModeValue("gray.600", "gray.200")

  function handleModalClose() {
    setApproving(false);
    setActiveHash(undefined);
    onClose();
  }

  function formatDisplay(item: string) {

    // return Number(item).toLocaleString('en-US', {currency: 'USD', style: 'currency', maximumFractionDigits:4, maximumSignificantDigits: 7})
    return Number(item).toLocaleString('en-US', {currency: 'USD', style: 'currency', maximumFractionDigits:2})
  }

  return (
      <Container
          cursor={"pointer"}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            bgGradient: useColorModeValue(
            "linear(to-r, sprout.200, teal.200)",
            "linear(to-l, blue.700, teal.700)"
            )
          }}
          onClick={onOpen}
          mt={1}
          px={5}
          py={3}
          flex="1"
          borderRadius="2xl"
          bg={useColorModeValue("white", "dark.100")}
          sx={{userSelect : 'none'}}
      >
    <Box>
      <Flex>
        <Box alignSelf="center">
          <Text fontSize={"2xl"}
                // pb={3}
                color={optionRowTextColor}
          >
            ${Number(formattedStrike).toFixed(2)}
          </Text>
        </Box>
        <Spacer/>
        <Box fontWeight="semibold" lineHeight={{ base: 1.8, md: 1.8 }}>
          <Stack spacing={{ base: 3, md: 8 }} direction="row">
            <Stack spacing={1} direction="column" >
              <Text fontSize="xs" color="gray.400" fontWeight="bold">Ask</Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">{ask? formatDisplay(ask) : "--"}</Text>
            </Stack>
            <Stack spacing={1} direction="column">
              <Text fontSize="xs" color="gray.400" fontWeight="bold">Bid</Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">{bid? formatDisplay(bid) : "--"}</Text> </Stack>
          </Stack>
        </Box>
        <Spacer/>
        <Box fontWeight="semibold" lineHeight={{ base: 1.8, md: 1.8 }}>
          <Stack spacing={1} direction="column" >  <Text fontSize="sm" color="gray.400" fontWeight="bold">Last</Text><Text fontSize={{ base: "xs", md: "md" }} color={optionRowTextColor}>{last? formatDisplay(last) : "--"}</Text></Stack>
        </Box>
      </Flex>
      <Modal  motionPreset="slideInBottom" isOpen={isOpen}  onClose={handleModalClose}
              scrollBehavior={isMobile ?"inside" : "outside"} size={isMobile ? 'full' : 'lg' }>
        <ModalOverlay />
        <ModalContent borderRadius={isMobile ? 'none' : '2xl'}>
          <ModalCloseButton />
          <ModalBody>
            <Box sx={(!approving && !activeHash) ? { display:'block' }:{ display:'none' }}>
              <OptionDetails appCommon={appCommon} sellBuy={option} positionHash={positionHash} hooks={{approving, setApproving, activeHash, setActiveHash}} optionData={optionData} /></Box>
            { (approving || activeHash) && <Txmonitor txHash={activeHash}/> }
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
      </Container>
  );
}

export default OptionRow;
