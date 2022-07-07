import { Box, HStack, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { decodeBase64Uri } from "../utils/ethMethods";
import { IMAGE_ASSETS } from "../utils/imageAssets";
import useTruncateAddress from "../hooks/useTruncateAddress";

function GrowthLeadBox({
  position,
  base64Uri,
  owner,
  growth,
}: {
  base64Uri: string;
  position: number;
  owner: string;
  growth: number;
}) {
  let decodedMetadata: any;
  try {
    decodedMetadata = decodeBase64Uri(base64Uri);
  } catch (e) {
    console.error(e);
    return <></>;
  }
  console.log(decodedMetadata);
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
  console.log(type, stage, emotion);
  const imgSrc = IMAGE_ASSETS.getPottedPlant(
    type,
    stage,
    emotion.toLowerCase()
  );

  return (
    <HStack>
      <Text fontSize={"xl"}>#{position}</Text>
      <Box>
        <Image w={10} src={imgSrc} />
      </Box>
      <VStack>
        <Text>{name}</Text>
        <Text>{`Growth: ${growth}%`}</Text>
      </VStack>
      <Text>{useTruncateAddress(owner)}</Text>
      {/*<Box>*/}
      {/*  <VStack>*/}
      {/*    <Text fontSize={'lg'}>{name}</Text>*/}
      {/*    {*/}
      {/*      isLoading ?*/}
      {/*        <Spinner/> :*/}
      {/*        <Text fontSize={'3xl'}>{amount}</Text>*/}
      {/*    }*/}
      {/*  </VStack>*/}
      {/*</Box>*/}
    </HStack>
  );
}

export default GrowthLeadBox;
