import {
  Box,
  Center,
  HStack,
  Image,
  Spinner,
  Stack,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { decodeBase64Uri } from "../utils/ethMethods";
import { IMAGE_ASSETS } from "../utils/imageAssets";
import useTruncateAddress from "../hooks/useTruncateAddress";
import { isMobile } from "react-device-detect";

function GrowthLeadBox({
  position,
  base64Uri,
  owner,
  growth,
  loading,
}: {
  base64Uri: string;
  position: number;
  owner: string;
  growth: number;
  loading: boolean;
}) {
  let decodedMetadata: any;
  try {
    decodedMetadata = decodeBase64Uri(base64Uri);
  } catch (e) {
    console.error(e);
    return <></>;
  }
  const name = decodedMetadata.name;
  const classObj = decodedMetadata.attributes.find(
    (a: any) => a.trait_type === "Class"
  );
  const emoObj = decodedMetadata.attributes.find(
    (a: any) => a.trait_type === "Emotion"
  );
  const type = classObj && classObj.value;
  const emotion = emoObj && emoObj.value;
  const stage = Math.floor(growth / 2000);
  const imgSrc = IMAGE_ASSETS.getPottedPlant(
    type,
    stage,
    emotion.toLowerCase()
  );

  return (
    <Tr key={position}>
      <Td
        display={{ base: "none", md: "table-cell" }}
        fontWeight={position === 1 ? "extrabold" : "medium"}
      >
        {position}
      </Td>
      <Td
        fontWeight={position === 1 ? "extrabold" : "medium"}
        fontSize={isMobile ? "12px" : "auto"}
      >
        <Image w={10} src={imgSrc} />
      </Td>
      <Td fontWeight={position === 1 ? "extrabold" : "medium"}>
        <Text>{name}</Text>
        <Text>{`Growth: ${growth / 100}%`}</Text>
      </Td>
      <Td>
        {loading ? (
          <Center>
            {" "}
            <Spinner size="xl" />
          </Center>
        ) : (
          useTruncateAddress(owner)
        )}
      </Td>
    </Tr>
  );
}

export default GrowthLeadBox;
