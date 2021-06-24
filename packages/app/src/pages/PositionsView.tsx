import React, { useEffect, useState } from "react";
import Positions from "../components/Positions";
import { getWalletBalance } from "../utils/ethMethods";
import { Balance } from "../types";
import { Currencies } from "../constants/currencies";
import { RouteComponentProps } from "@reach/router";
import { Container } from "@chakra-ui/react";
import {useWeb3React} from "@web3-react/core";

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
    <Container
      mt={100}
      p={0}
      shadow="md"
      borderWidth="1px"
      flex="1"
      borderRadius="lg"
    >
      {/*<WalletBalance ethWalletBalance={walletBalance.ETH} />*/}
      <Positions walletBalance={walletBalance} />
    </Container>
  );
}

export default PositionsView;
