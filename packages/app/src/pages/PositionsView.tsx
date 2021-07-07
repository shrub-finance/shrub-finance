import React, { useEffect, useState } from "react";
import Positions from "../components/Positions";
import { getWalletBalance } from "../utils/ethMethods";
import { Balance } from "../types";
import { Currencies } from "../constants/currencies";
import { RouteComponentProps } from "@reach/router";
import {Center, Container, Heading} from "@chakra-ui/react";
import {useWeb3React} from "@web3-react/core";
import {Icon} from "@chakra-ui/icons";
import {FaEthereum} from "react-icons/fa";

function PositionsView(props: RouteComponentProps) {
  const { active, library } = useWeb3React();
  const [walletBalance, setWalletBalance] = useState({ ETH: '0' } as Balance);
  useEffect(() => {
    async function inner() {
        if (!active) {
          console.error('Please connect your wallet');
          return;
        }
      for (const [symbol, symbolObj] of Object.entries(Currencies)) {
        const balance = await getWalletBalance(symbolObj.address, library);
        if (walletBalance[symbol] !== balance) {
          setWalletBalance({ ...walletBalance, [symbol]: balance });
        }
      }
    }

    inner().catch(console.error);
  }, [walletBalance, active, library]);

  return (
      <>
        <Heading mt={10}><Center><Icon as={FaEthereum} /> ETH Positions</Center></Heading>
        <Container
            mt={50}
            p={0}
            shadow="md"
            borderWidth="1px"
            flex="1"
            borderRadius="2xl"
            fontFamily="Montserrat"
        >
          {/*<WalletBalance ethWalletBalance={walletBalance.ETH} />*/}
          <Positions walletBalance={walletBalance} />
        </Container>
      </>
  );
}

export default PositionsView;
