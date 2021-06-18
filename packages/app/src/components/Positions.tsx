import React from "react";
import { ethers } from "ethers";
import {
  Stack,
  VisuallyHidden,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
} from "@chakra-ui/react";

import {
  depositEth,
  depositToken,
  withdraw,
  getAvailableSignerBalance,
  approveToken,
} from "../utils/ethMethods";
import UpdatePositions from "./UpdatePositions";
import { Balance } from "../types";
import { Currencies } from "../constants/currencies";

function Positions({ walletBalance }: { walletBalance: Balance }) {
  const [action, setAction] = React.useState("");

  const [shrubBalance, setShrubBalance] = React.useState({} as Balance);
  React.useEffect(() => {
    async function inner() {
      for (const currencyObj of Object.values(Currencies)) {
        const { symbol, address: tokenContractAddress } = currencyObj;
        const balance = await getAvailableSignerBalance(tokenContractAddress);
        if (shrubBalance[symbol] !== balance) {
          setShrubBalance({ ...shrubBalance, [symbol]: balance });
        }
      }
    }
    inner().catch(console.error);
  }, [shrubBalance]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = React.useState("0");
  const [modalCurrency, setModalCurrency] = React.useState(
    "ETH" as keyof typeof Currencies
  );

  function handleClick(passButtonText: string) {
    onOpen();
    setAction(passButtonText);
  }

  function ethToWei(eth: number | string) {
    const amountString = eth.toString();
    const bigAmountEth = ethers.BigNumber.from(amountString);
    const multiplier = ethers.BigNumber.from(10).pow(
      Currencies[modalCurrency].decimals
    );
    return bigAmountEth.mul(multiplier);
  }

  const tableRows = [];
  for (const currency of Object.keys(Currencies)) {
    tableRows.push(
      <Tr>
        <Td>{currency}</Td>
        <Td></Td>
        <Td></Td>
        <Td>{shrubBalance[currency]}</Td>
        <Td>
          <Stack spacing={4} direction="row" align="center">
            <Button
              colorScheme="teal"
              size="xs"
              onClick={() => handleClick("Withdraw")}
            >
              Withdraw
            </Button>
            <Button
              colorScheme="teal"
              size="xs"
              onClick={() => handleClick("Deposit")}
            >
              Deposit
            </Button>
          </Stack>
        </Td>
      </Tr>
    );
  }

  return (
    <Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Asset</Th>
            <Th>Total</Th>
            <Th>Locked</Th>
            <Th>UnLocked</Th>
            <Th>
              <VisuallyHidden />
            </Th>
          </Tr>
        </Thead>
        <Tbody>{tableRows}</Tbody>
      </Table>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{action}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <UpdatePositions
              value={value}
              setValue={setValue}
              modalCurrency={modalCurrency}
              setModalCurrency={setModalCurrency}
              walletBalance={walletBalance}
              shrubBalance={shrubBalance}
              action={action}
            />
          </ModalBody>
          <ModalFooter>
            {modalCurrency !== "ETH" && action === "Deposit" ? (
              <Button
                colorScheme="teal"
                mr={200}
                onClick={() =>
                  approveToken(
                    Currencies[modalCurrency].address,
                    ethToWei(value)
                  ).catch(console.error)
                }
              >
                Approve
              </Button>
            ) : null}
            <Button
              colorScheme="teal"
              onClick={() => {
                if (action === "Deposit") {
                  if (modalCurrency === "ETH") {
                    depositEth(ethToWei(value)).catch(console.error);
                  } else {
                    depositToken(
                      Currencies[modalCurrency].address,
                      ethToWei(value)
                    ).catch(console.error);
                  }
                } else if (action === "Withdraw") {
                  withdraw(
                    Currencies[modalCurrency].address,
                    ethToWei(value)
                  ).catch(console.error);
                }
              }}
            >
              {action}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Positions;
