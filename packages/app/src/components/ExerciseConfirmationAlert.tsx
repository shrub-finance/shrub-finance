import React, { useEffect, useRef, useContext, useState } from "react";
import { ethers } from "ethers";
import { exerciseLight } from "../utils/ethMethods";
import { useWeb3React } from "@web3-react/core";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { ToastDescription } from "./TxMonitoring";
import { TxContext } from "./Store";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  HStack,
  Text,
  useToast,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { OrderCommon } from "../types";
function ExcerciseConfirmationAlert(prop: {
  pair: string;
  common: OrderCommon;
  amount: string;
  onCustomClose: any;
}) {
  const callMeCancel = () => {
    prop.onCustomClose("NO");
    onClose();
  };

  const {
    isOpen: isOpenConfirmDialog,
    onOpen: onOpenConfirmDialog,
    onClose,
  } = useDisclosure();

  const ctaColor = useColorModeValue("sprout", "teal");
  const cancelRef = useRef();
  const toast = useToast();
  const [localError, setLocalError] = useState("");
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { library, chainId } = useWeb3React();
  useEffect(() => {
    onOpenConfirmDialog();
  }, []);
  async function exerciseOption() {
    try {
      const bigAmount = ethers.utils.parseUnits(prop.amount, 18);
      const tx = await exerciseLight(prop.common, bigAmount, library);
      const { optionType, strike } = prop.common;
      const formattedStrike = ethers.utils.formatUnits(strike, 6);
      const description = `Exercise ${prop.pair} option for $${
        Number(prop.amount) * Number(formattedStrike)
      } at strike $${formattedStrike}`;
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      const receipt = await tx.wait();
      const toastDescription = ToastDescription(
        description,
        receipt.transactionHash,
        chainId
      );
      toast({
        title: "Transaction Confirmed",
        description: toastDescription,
        status: "success",
        isClosable: true,
        variant: "solid",
        position: "top-right",
      });
      pendingTxsDispatch({
        type: "update",
        txHash: receipt.transactionHash,
        status: "confirmed",
        data: { blockNumber: receipt.blockNumber },
      });
      return tx;
    } catch (e: any) {
      console.error(e);
      handleErrorMessages({ err: e });
    }
  }
  const callMeConfirm = () => {
    prop.onCustomClose("YES");
    exerciseOption();
    onClose();
  };
  return (
    <>
      <AlertDialog
        motionPreset="slideInBottom"
        // @ts-ignore
        leastDestructiveRef={cancelRef}
        isOpen={isOpenConfirmDialog}
        onClose={callMeCancel}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Exercise Option Confirmation</AlertDialogHeader>
          <AlertDialogCloseButton />
          <Divider />
          <AlertDialogBody>
            <Box fontSize="sm" pt={6}>
              <HStack spacing={8} fontSize={"sm"}>
                <VStack spacing={1.5} alignItems={"flex-start"}>
                  <Text>Price per contract</Text>
                  <Text>Quantity</Text>
                  <Text>buy</Text>
                </VStack>
                <VStack
                  spacing={1.5}
                  alignItems={"flex-start"}
                  fontWeight={"600"}
                >
                  <Text>1</Text>
                  <Text>2</Text>
                  <Text>3</Text>
                </VStack>
              </HStack>
            </Box>
            <Text
              fontSize={"sm"}
              bgColor={useColorModeValue("gray.100", "dark.300")}
              mt={6}
              p={"3"}
              rounded={"lg"}
              color={useColorModeValue("gray.600", "gray.400")}
              lineHeight={2.1}
              letterSpacing={".02rem"}
            >
              Placing this order{" "}
              <Text as="span" fontWeight={"bold"}>
                gives
              </Text>{" "}
              the{" "}
              <Text as="span" fontWeight={"bold"}>
                right`` to sMATIC
              </Text>{" "}
              for{" "}
              <Text as="span" fontWeight={"bold"}>
                sUSD/sMATIC
              </Text>{" "}
              <Text as="span" fontWeight={"bold"}>
                4
              </Text>
              .
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              // @ts-ignore
              ref={cancelRef}
              onClick={() => callMeCancel()}
            >
              Cancel
            </Button>
            <Button
              colorScheme={ctaColor}
              ml={3}
              onClick={() => callMeConfirm()}
            >
              Exercise
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export default ExcerciseConfirmationAlert;
