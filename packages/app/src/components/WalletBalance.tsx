import React from "react";
import { Container, HStack, Tag } from "@chakra-ui/react";

function WalletBalance({
  ethWalletBalance,
}: {
  ethWalletBalance: string | number;
}) {
  return (
    <div>
      <Container>
        <HStack spacing={4}>
          <Tag size={"lg"} key={"lg"} variant="solid" colorScheme="teal">
            {`${ethWalletBalance} ETH`}
          </Tag>
        </HStack>
      </Container>
    </div>
  );
}

export default WalletBalance;
