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
  useDisclosure,
} from "@chakra-ui/react";

import {AppCommon, OptionData, SellBuy} from '../types';
import OptionDetails from "./OptionDetails";
import {Txmonitor} from "./TxMonitoring";
import {currencySymbol} from "../utils/chainMethods";
import {useWeb3React} from "@web3-react/core";

const height = 100;

function OptionRow({appCommon, last, ask, bid, option, optionData}: {
  appCommon: AppCommon,
  last: string,
  ask: string,
  bid: string,
  option: SellBuy,
  optionData: OptionData
}) {
  const { optionType, formattedStrike } = appCommon;
  const { isOpen, onOpen, onClose} = useDisclosure();
  const [approving, setApproving] = React.useState(false);
  const [activeHash, setActiveHash] = useState<string>();
  const {chainId} = useWeb3React();

  function handleModalClose() {
    setApproving(false);
    setActiveHash(undefined);
    onClose();
  }

  return (
    <Box>
      <Divider mb={5} />
      <Flex>
        <Box h={height}>
          <Text fontSize={"2xl"} pb={3}>
            ${Number(formattedStrike).toFixed(2)}
          </Text>
          <Tag size={"sm"} colorScheme="teal">
            {optionType}
          </Tag>
        </Box>
        <Spacer/>
        <Box h={height} fontWeight="semibold" lineHeight={1.8}>
          <Text>Last: ${last}</Text>
          <Text>Ask: ${ask}</Text>
          <Text>Bid: ${bid}</Text>
        </Box>
        <Spacer/>
        <Box h={height}>
          <Stack spacing={4} direction="row" align="center">
            <Button colorScheme="teal" onClick={onOpen} size="sm" variant="outline" borderRadius="2xl">
              {option === 'BUY' ? "Buy Options" : "Sell Options"}
            </Button>
          </Stack>
        </Box>
      </Flex>
      <Modal  motionPreset="slideInBottom" size={"2xl"} isOpen={isOpen}  onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalCloseButton />
          <ModalHeader borderBottomWidth="1px">{currencySymbol(chainId)} Order</ModalHeader>
          <ModalBody>
            <Box sx={(!approving && !activeHash) ? { display:'block' }:{ display:'none' } }>
              <OptionDetails appCommon={appCommon} sellBuy={option} hooks={{approving, setApproving, activeHash, setActiveHash}} optionData={optionData} /></Box>
            { (approving || activeHash) && <Txmonitor txHash={activeHash}/> }
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default OptionRow;
