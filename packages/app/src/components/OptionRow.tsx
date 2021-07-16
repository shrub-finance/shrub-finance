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

import { AppCommon, SellBuy } from '../types';
import OptionDetails from "./OptionDetails";
import {Txmonitor} from "./TxMonitoring";

const height = 100;

function OptionRow({appCommon, last, ask, bid, option}: {appCommon: AppCommon, last: string, ask: string, bid: string, option: SellBuy}) {
  const { optionType, formattedStrike } = appCommon;
  const { isOpen: isOpenLimitBuy, onOpen: onOpenLimitBuy, onClose: onCloseLimitBuy } = useDisclosure();
  const [approving, setApproving] = React.useState(false);
  const [activeHash, setActiveHash] = useState<string>();

  return (
    <Box fontFamily="Montserrat">
      <Divider mb={5} />
      <Flex>
        <Box h={height}>
          <Text fontSize={"2xl"} pb={3}>
            ${formattedStrike}
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
            <Button colorScheme="teal" onClick={onOpenLimitBuy} size="sm" variant="outline" borderRadius="2xl">
              {option === 'BUY' ? "Buy Options" : "Sell Options"}
            </Button>
          </Stack>
        </Box>
      </Flex>
      <Modal  motionPreset="slideInBottom" size={"sm"} isOpen={isOpenLimitBuy}  onClose={onCloseLimitBuy}>
        <ModalOverlay />
        <ModalContent fontFamily="Montserrat" borderRadius="2xl">
          <ModalCloseButton />
          <ModalHeader borderBottomWidth="1px">ETH Order</ModalHeader>
          <ModalBody>
            { (!approving && !activeHash) && <OptionDetails appCommon={appCommon} sellBuy={option} hooks={{approving, setApproving, activeHash, setActiveHash}}/> }
            { (approving || activeHash) && <Txmonitor txHash={activeHash}/> }
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default OptionRow;
