import Positions from "../components/Positions";
import { RouteComponentProps } from "@reach/router";
import {Center, Heading} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/icons";
import {GiCoins} from "react-icons/gi";



function PositionsView(props: RouteComponentProps) {
    return (
      <>
        <Heading mt={10}><Center><Icon as={GiCoins} mr={2}/> Shrubfolio</Center></Heading>
          <Positions />
      </>
  );
}

export default PositionsView;
