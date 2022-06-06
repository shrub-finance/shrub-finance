import { RouteComponentProps } from "@reach/router";
import react from "react";
import { Box } from "@chakra-ui/react";
function OpenSeaView(props: RouteComponentProps) {
  return (
    <>
      <Box mt="5%" style={{ flex: 1 }}>
        <iframe
          src="https://opensea.io/collection/shrub-paper-gardens"
          frameBorder={0}
          allowFullScreen
          style={{ height: "100vh", width: "100vw" }}
        ></iframe>
      </Box>
    </>
  );
}
export default OpenSeaView;
