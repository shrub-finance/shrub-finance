// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./JsonBuilder.sol";

interface IPaperPotMetadata {
    function tokenMetadata(
        uint tokenId,
        bool isSad
    ) external view returns (string memory);
}

contract PaperPotMetadata is IPaperPotMetadata, JsonBuilder {
    struct ERC1155MetadataStructure {
        bool isImageLinked;
        string name;
        string description;
        string createdBy;
        string image;
        ERC1155MetadataAttribute[] attributes;
    }

    struct ERC1155MetadataAttribute {
        bool includeDisplayType;
        bool includeTraitType;
        bool isValueAString;
        string displayType;
        string traitType;
        string value;
    }

    function tokenMetadata(
        uint tokenId,
        bool isSad
    ) external view returns (string memory) {
//        string memory json = string(abi.encodePacked(_getJson(tokenId, rarity, tokenMass, alphaMass, isAlpha, mergeCount)));
        string memory json = "";
        return string(abi.encodePacked('data:application/json;utf8,', json));
    }

    function _getJson(uint tokenId, string memory class, string memory emotion) private returns (string memory) {
        ERC1155MetadataStructure memory metadata = ERC1155MetadataStructure({
            isImageLinked: true,
            name: "Potted Plant #1",
            description: "Potter Plant #1 Description",
            createdBy: "Shrub.finance",
            image: "ipfs://image",
            attributes: _getJsonAttributes()
        });
        return _generateERC1155Metadata(metadata);
    }

    function _getJsonAttributes() private returns (ERC1155MetadataAttribute[] memory) {
        ERC1155MetadataAttribute[] memory attributes;
        return attributes;
    }

    function _generateERC1155Metadata(ERC1155MetadataStructure memory metadata) private pure returns (string memory) {
        bytes memory byteString;

        byteString = abi.encodePacked(
            byteString,
            _openJsonObject());

        byteString = abi.encodePacked(
            byteString,
            _pushJsonPrimitiveStringAttribute("name", metadata.name, true));

        byteString = abi.encodePacked(
            byteString,
            _pushJsonPrimitiveStringAttribute("description", metadata.description, true));

        byteString = abi.encodePacked(
            byteString,
            _pushJsonPrimitiveStringAttribute("created_by", metadata.createdBy, true));

        if(metadata.isImageLinked) {
            byteString = abi.encodePacked(
                byteString,
                _pushJsonPrimitiveStringAttribute("image", metadata.image, true));
        } else {
            byteString = abi.encodePacked(
                byteString,
                _pushJsonPrimitiveStringAttribute("image_data", metadata.image, true));
        }

        byteString = abi.encodePacked(
            byteString,
            _pushJsonComplexAttribute("attributes", _getAttributes(metadata.attributes), false));

        byteString = abi.encodePacked(
            byteString,
            _closeJsonObject());

        return string(byteString);
    }

    function _getAttributes(ERC1155MetadataAttribute[] memory attributes) private pure returns (string memory) {
        bytes memory byteString;

        byteString = abi.encodePacked(
            byteString,
            _openJsonArray());

        for (uint i = 0; i < attributes.length; i++) {
            ERC1155MetadataAttribute memory attribute = attributes[i];

            byteString = abi.encodePacked(
                byteString,
                _pushJsonArrayElement(_getAttribute(attribute), i < (attributes.length - 1)));
        }

        byteString = abi.encodePacked(
            byteString,
            _closeJsonArray());

        return string(byteString);
    }

    function _getAttribute(ERC1155MetadataAttribute memory attribute) private pure returns (string memory) {
        bytes memory byteString;

        byteString = abi.encodePacked(
            byteString,
            _openJsonObject());

        if(attribute.includeDisplayType) {
            byteString = abi.encodePacked(
                byteString,
                _pushJsonPrimitiveStringAttribute("display_type", attribute.displayType, true));
        }

        if(attribute.includeTraitType) {
            byteString = abi.encodePacked(
                byteString,
                _pushJsonPrimitiveStringAttribute("trait_type", attribute.traitType, true));
        }

        if(attribute.isValueAString) {
            byteString = abi.encodePacked(
                byteString,
                _pushJsonPrimitiveStringAttribute("value", attribute.value, false));
        } else {
            byteString = abi.encodePacked(
                byteString,
                _pushJsonPrimitiveNonStringAttribute("value", attribute.value, false));
        }

        byteString = abi.encodePacked(
            byteString,
            _closeJsonObject());

        return string(byteString);
    }
}

//    function _getJson(uint _tokenId, bool _isSad) internal returns (string memory) {
//        bytes memory byteString;
//
//        byteString = abi.encodePacked(
//            byteString,
//            _openJsonObject()
//        );
//
//        byteString = abi.encodePacked(
//            byteString,
//            _pushJsonPrimitiveStringAttribute("name", metadata.name, true)
//        );
//
//        byteString = abi.encodePacked(
//            byteString,
//            _pushJsonPrimitiveStringAttribute("description", metadata.description, true));
//
//        byteString = abi.encodePacked(
//            byteString,
//            _pushJsonPrimitiveStringAttribute("created_by", metadata.createdBy, true));
//
//        if(metadata.isImageLinked) {
//            byteString = abi.encodePacked(
//                byteString,
//                _pushJsonPrimitiveStringAttribute("image", metadata.image, true));
//        } else {
//            byteString = abi.encodePacked(
//                byteString,
//                _pushJsonPrimitiveStringAttribute("image_data", metadata.image, true));
//        }
//
//        byteString = abi.encodePacked(
//            byteString,
//            _pushJsonComplexAttribute("attributes", _getAttributes(metadata.attributes), false));
//
//        byteString = abi.encodePacked(
//            byteString,
//            _closeJsonObject()
//        );
//
//        return string(byteString);
//    }
