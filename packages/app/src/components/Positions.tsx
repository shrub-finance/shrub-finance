import React, {useEffect} from "react";
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
  TableRowProps
} from "@chakra-ui/react";

import {
  depositEth,
  depositToken,
  withdraw,
  getAvailableSignerBalance,
  approveToken,
  getSignerAddress,
  getFilledOrders
} from "../utils/ethMethods";
import UpdatePositions from "./UpdatePositions";
import { Balance } from "../types";
import { Currencies } from "../constants/currencies";
import {useWeb3React} from "@web3-react/core";

function Positions({ walletBalance }: { walletBalance: Balance }) {
  const { active, library } = useWeb3React();
  const tableRows:TableRowProps[] = [];
  const tableRowsOptions:any = [];
  const [action, setAction] = React.useState("");

  const [optionsRows, setOptionsRows] = React.useState(<></>)

  const [shrubBalance, setShrubBalance] = React.useState({} as Balance);
  React.useEffect(() => {
    async function inner() {
      for (const currencyObj of Object.values(Currencies)) {
        const { symbol, address: tokenContractAddress } = currencyObj;
        const balance = await getAvailableSignerBalance(tokenContractAddress, library);
        if (shrubBalance[symbol] !== balance) {
          setShrubBalance({ ...shrubBalance, [symbol]: balance });
        }
      }
    }
    inner().catch(console.error);
  }, [shrubBalance]);


  useEffect(() => {
    async function inner() {
      const address = await getSignerAddress();
      const filledOrders = await getFilledOrders(address, library);
      // Populate Option Positions Table
      for (const [positionHash, details] of Object.entries(filledOrders)) {
        const {pair, strike, expiry, optionType, amount} = details as {baseAsset: string, quoteAsset: string, pair: string, strike: string, expiry: string, optionType:string, amount:number};
        tableRowsOptions.push(
            <Tr>
              <Td>{pair}</Td>
              <Td>{strike}</Td>
              <Td>{expiry}</Td>
              <Td>{optionType}</Td>
              <Td>{amount}</Td>
            </Tr>
        )
      }
      setOptionsRows(tableRowsOptions);
    }
    inner().catch(console.error);
  }, [])



  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = React.useState("0");
  const [modalCurrency, setModalCurrency] = React.useState(
    "ETH" as keyof typeof Currencies
  );

  function handleClickWithdraw() {
    handleClick('Withdraw');
  }

  function handleClickDeposit() {
    handleClick('Deposit');
  }

  function handleClick(passButtonText: string) {
    onOpen();
    setAction(passButtonText);
  }

  // Populate Balance Table
  for (const currency of Object.keys(Currencies)) {
    tableRows.push(
      <Tr>
        <Td>{currency}</Td>
        <Td/>
        <Td/>
        <Td>{shrubBalance[currency]}</Td>
        <Td>
          <Stack spacing={4} direction="row" align="center">
            <Button
              colorScheme="teal"
              size="xs"
              onClick={handleClickWithdraw}
            >
              Withdraw
            </Button>
            <Button
              colorScheme="teal"
              size="xs"
              onClick={handleClickDeposit}
            >
              Deposit
            </Button>
          </Stack>
        </Td>
      </Tr>
    );
  }


  return (
      <>
        <Box>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Asset</Th>
                <Th>Total</Th>
                <Th>Locked</Th>
                <Th>Unlocked</Th>
                <Th>
                  <VisuallyHidden/>
                </Th>
              </Tr>
            </Thead>
            <Tbody>{tableRows}</Tbody>
          </Table>
          <Modal onClose={onClose} isOpen={isOpen} isCentered={true}>
            <ModalOverlay/>
            <ModalContent>
              <ModalHeader>{action}</ModalHeader>
              <ModalCloseButton/>
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
                        onClick={() => {
                          if (active) {
                            approveToken(
                                Currencies[modalCurrency].address,
                                ethers.utils.parseUnits(value),
                                library
                            ).catch(console.error)
                          }
                        }
                      }
                    >
                      Approve
                    </Button>
                ) : null}
                <Button
                    colorScheme="teal"
                    onClick={() => {
                        if (!active) {
                          console.error('Please connect your wallet');
                          return;
                        }
                      if (action === "Deposit") {
                        if (modalCurrency === "ETH") {
                          depositEth(ethers.utils.parseUnits(value), library).catch(console.error);
                        } else {
                          depositToken(
                              Currencies[modalCurrency].address,
                              ethers.utils.parseUnits(value),
                              library
                          ).catch(console.error);
                        }
                      } else if (action === "Withdraw") {
                        withdraw(
                            Currencies[modalCurrency].address,
                            ethers.utils.parseUnits(value),
                            library
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
        <br/>
        <Box>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Pair</Th>
                <Th>Strike</Th>
                <Th>Expiry</Th>
                <Th>Option Type</Th>
                <Th>Amount</Th>
                <Th>
                  <VisuallyHidden/>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {optionsRows}
            </Tbody>
          </Table>
        </Box>
      </>
  );
}

export default Positions;
