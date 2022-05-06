// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
// Inspired by merge

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./JsonBuilder.sol";
import "./PaperPotEnum.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./basic/baseERC1155.sol";
import "./PaperPotEnum.sol";

interface IPaperPotMetadata {
    function tokenMetadata(
        string memory name,
        uint seedTokenId,
        uint growth,
        bool isSad
    ) external view returns (string memory);
}

contract PaperPotMetadata is IPaperPotMetadata, JsonBuilder, Ownable, ERC165 {
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

    string private _imageBaseUri;

    // images for the potted plants by class and stage
    mapping(NftClass => mapping(GrowthStages => string)) private _pottedPlantImages;

    using Base64 for string;
    using Strings for uint256;

    constructor(string memory imageBaseUri_) {
        _imageBaseUri = imageBaseUri_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
        interfaceId == type(IPaperPotMetadata).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    function tokenMetadata(
        string memory name,
        uint seedTokenId,
        uint growth,
        bool isSad
    ) external view returns (string memory) {
        string memory base64json = Base64.encode(bytes(string(abi.encodePacked(_getJson(name, seedTokenId, growth, isSad)))));
        return string(abi.encodePacked('data:application/json;base64,', base64json));
    }

    function _getJson(string memory name, uint _seedTokenId, uint _growth, bool _isSad) private view returns (string memory) {
        ERC1155MetadataStructure memory metadata = ERC1155MetadataStructure({
            isImageLinked: true,
            name: name,
            description: "created by Shrub.finance",
            createdBy: "Shrub.finance",
            image: string(abi.encodePacked(_getImage(_seedTokenId, _growth, _isSad))),
            attributes: _getJsonAttributes(_seedTokenId, _growth, _isSad)
        });
        return _generateERC1155Metadata(metadata);
    }

    function _getImage(uint seedTokenId, uint growth, bool isSad) private view returns (string memory) {
        string[3] memory classRarity = getClassFromSeedId(seedTokenId);
        string memory class = classRarity[0];
        string memory sadString = isSad ? "sad" : "happy";
        uint growthLevel = getGrowthLevel(growth);
        return string(abi.encodePacked(_imageBaseUri, "pottedplant-", class, "-", growthLevel.toString(), "-", sadString));
    }

    function getGrowthLevel(uint growth) internal pure returns (uint) {
        return growth / 2000;
    }

    function _getJsonAttributes(uint _seedTokenId, uint growth, bool isSad) private pure returns (ERC1155MetadataAttribute[] memory) {
        string[3] memory classRarity = getClassFromSeedId(_seedTokenId);
        ERC1155MetadataAttribute[] memory attributes = new ERC1155MetadataAttribute[](6);
        attributes[0] = _getERC721MetadataAttribute(false, true, true, "", "Class", classRarity[0]);
        attributes[1] = _getERC721MetadataAttribute(false, true, true, "", "Rarity", classRarity[1]);
        attributes[2] = _getERC721MetadataAttribute(false, true, false, "", "DNA", getDnaFromSeedId(_seedTokenId).toString());
        attributes[3] = _getERC721MetadataAttribute(false, true, false, "", "Growth", growth.toString());
        attributes[4] = _getERC721MetadataAttribute(false, true, true, "", "Emotion", isSad ? "Sad" : "Happy");
        attributes[5] = _getERC721MetadataAttribute(false, true, true, "", "Planted Seed", classRarity[2]);
        return attributes;
    }

    function _getERC721MetadataAttribute(
        bool includeDisplayType,
        bool includeTraitType,
        bool isValueAString,
        string memory displayType,
        string memory traitType,
        string memory value
    ) private pure returns (ERC1155MetadataAttribute memory) {
        ERC1155MetadataAttribute memory attribute = ERC1155MetadataAttribute({
        includeDisplayType: includeDisplayType,
        includeTraitType: includeTraitType,
        isValueAString: isValueAString,
        displayType: displayType,
        traitType: traitType,
        value: value
        });
        return attribute;
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

    function seedIdInRange(uint256 _seedTokenId) private pure returns (bool) {
        return _seedTokenId > 0 && _seedTokenId < 10001;
    }

    function getClassFromSeedId(uint256 _seedTokenId) private pure returns (string[3] memory) {
        require(seedIdInRange(_seedTokenId), "seedTokenId not in range");
        if (_seedTokenId > 1110) {
            return ["Wonder", "Common", string(abi.encodePacked("Paper Seed of Wonder #",(_seedTokenId - 1110).toString()))];
        }
        if (_seedTokenId > 110) {
            return ["Passion", "Uncommon", string(abi.encodePacked("Paper Seed of Passion #",(_seedTokenId - 110).toString()))];
        }
        if (_seedTokenId > 10) {
            return ["Hope", "Rare", string(abi.encodePacked("Paper Seed of Hope #",(_seedTokenId - 10).toString()))];
        }
        return ["Power", "Legendary", string(abi.encodePacked("Paper Seed of Power #",_seedTokenId.toString()))];
    }

    function getDnaFromSeedId(uint256 _seedTokenId) private pure returns (uint256 dna) {
        require(seedIdInRange(_seedTokenId), "seedTokenId not in range");
        return _seedTokenId % 100;
    }

//    function setPottedPlantImages(NftClass class, GrowthStages[] calldata stages, string[] calldata images) public onlyOwner {
//        require(stages.length == images.length, "length mismatch");
//        require(class <= type(NftClass).max, "invalid class");
//        for (uint i = 0; i < stages.length; i++) {
//            require(stages[i] <= type(GrowthStages).max, "invalid stage");
//            _pottedPlantImages[class][stages[i]] = images[i];
//        }
//    }

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
