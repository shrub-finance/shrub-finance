// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
// Inspired by merge

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./JsonBuilder.sol";
import "./AdminControl.sol";
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

    function shrubTokenMetadata(
        uint tokenId,
        uint seedTokenId,
        bool isSad
    ) external view returns (string memory);

    function setShrubName(uint seedTokenId_, string memory newName_) external;
}

contract PaperPotMetadata is IPaperPotMetadata, JsonBuilder, Ownable, AdminControl, ERC165 {
    uint constant POTTED_PLANT_BASE_TOKENID = 10 ** 6;

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
    
    struct CustomMetadata {
        string name;
        string imageUri;
        string bodyType;
        string background;
        string top;
        string hat;
        string expression;
        string leftHand;
        string rightHand;
        string clothes;
        string accessory;
    }

    string private _imageBaseUri;

    // images for the potted plants by class and stage
    mapping(NftClass => mapping(GrowthStages => string)) private _pottedPlantImages;

    // default image uri for shrubs based on class
    mapping(NftClass => string) private _shrubDefaultUris;

    // uri for shrubs based on seedTokenId
    mapping(uint => CustomMetadata) private _shrubSeedUris;

    using Base64 for string;
    using Strings for uint256;

    constructor(
        string memory imageBaseUri_,
        string[4] memory shrubDefaultUris_
) {
        require(shrubDefaultUris_.length == 4, "PaperPotMetadata: must be 4 uris - wonder, passion, hope, power");

        // setup the initial admin as the contract deployer
        setAdmin(_msgSender(), true);

        adminSetDefaultUris(shrubDefaultUris_);
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

    function shrubTokenMetadata(
        uint tokenId,
        uint seedTokenId,
        bool isSad
    ) external view returns (string memory) {
        string memory base64json = Base64.encode(bytes(string(abi.encodePacked(_getJsonShrub(tokenId, seedTokenId, isSad)))));
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

    function _getJsonShrub(uint _tokenId, uint _seedTokenId, bool _isSad) private view returns (string memory) {
        ERC1155MetadataStructure memory metadata = ERC1155MetadataStructure({
            isImageLinked: true,
            name: _getNameShrub(_tokenId, _seedTokenId),
            description: "created by Shrub.finance",
            createdBy: "Shrub.finance",
            image: string(abi.encodePacked(_getImageShrub(_seedTokenId))),
            attributes: _getJsonAttributesShrub(_tokenId, _seedTokenId, _isSad)
        });
        return _generateERC1155Metadata(metadata);
    }

    function _getImage(uint seedTokenId, uint growth, bool isSad) private view returns (string memory) {
        string[3] memory classRarity = getClassFromSeedId(seedTokenId);
        string memory class = classRarity[0];
        string memory sadString = isSad ? "sad" : "happy";
        uint growthLevel = getGrowthLevel(growth);
        return string(abi.encodePacked(_imageBaseUri, "pottedplant-", class, "-", growthLevel.toString(), "-", sadString, ".svg"));
    }

    function _getImageShrub(uint seedTokenId) private view returns (string memory) {
        // Return the seedTokenId specific image if it exists
        if (seedTokenId != 0) {
            string memory shrubSeedUri = _shrubSeedUris[seedTokenId].imageUri;
            if (bytes(shrubSeedUri).length > 0) {
                return shrubSeedUri;
            }
        }

        // Otherwise return the default based on class
        NftClass class = getNftClassFromSeedId(seedTokenId);
        return _shrubDefaultUris[class];
    }
    
    function _getNameShrub(uint tokenId_, uint seedTokenId_) private view returns (string memory) {
        // Return the seedTokenId specific image if it exists
        if (seedTokenId_ != 0) {
            string memory shrubSeedUriName = _shrubSeedUris[seedTokenId_].name;
            if (bytes(shrubSeedUriName).length > 0) {
                return shrubSeedUriName;
            }
        }
        
        // Otherwise return the default based on tokenId
        return string(abi.encodePacked("Shrub #", (tokenId_ - 2000000).toString()));
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

    function _getJsonAttributesShrub(uint _tokenId, uint _seedTokenId, bool isSad) private view returns (ERC1155MetadataAttribute[] memory) {
        string[3] memory classRarity = getClassFromSeedId(_seedTokenId);
        ERC1155MetadataAttribute[] memory attributes = new ERC1155MetadataAttribute[](14);
        attributes[0] = _getERC721MetadataAttribute(false, true, true, "", "Class", classRarity[0]);
        attributes[1] = _getERC721MetadataAttribute(false, true, false, "", "DNA", getDnaFromSeedId(_seedTokenId).toString());
        attributes[2] = _getERC721MetadataAttribute(false, true, true, "", "Emotion", isSad ? "Sad" : "Happy");
        attributes[3] = _getERC721MetadataAttribute(false, true, true, "", "Planted Seed", classRarity[2]);
        attributes[4] = _getERC721MetadataAttribute(false, true, true, "", "Birth Order", (_tokenId - 2000000).toString());
        if (bytes(_shrubSeedUris[_seedTokenId].bodyType).length == 0) {
            return attributes;
        }
        uint i = 5;
        attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Body Type", _shrubSeedUris[_seedTokenId].bodyType);
        i++;
        if (bytes(_shrubSeedUris[_seedTokenId].background).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Background", _shrubSeedUris[_seedTokenId].background);
            i++;
        }
        if (bytes(_shrubSeedUris[_seedTokenId].top).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Top", _shrubSeedUris[_seedTokenId].top);
            i++;
        }
        if (bytes(_shrubSeedUris[_seedTokenId].hat).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Hat", _shrubSeedUris[_seedTokenId].hat);
            i++;
        }
        if (bytes(_shrubSeedUris[_seedTokenId].leftHand).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Left Hand", _shrubSeedUris[_seedTokenId].leftHand);
            i++;
        }
        if (bytes(_shrubSeedUris[_seedTokenId].rightHand).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Right Hand", _shrubSeedUris[_seedTokenId].rightHand);
            i++;
        }
        if (bytes(_shrubSeedUris[_seedTokenId].clothes).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Clothes", _shrubSeedUris[_seedTokenId].clothes);
            i++;
        }
        if (bytes(_shrubSeedUris[_seedTokenId].accessory).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Accessory", _shrubSeedUris[_seedTokenId].accessory);
            i++;
        }
        if (bytes(_shrubSeedUris[_seedTokenId].expression).length > 0) {
            attributes[i] = _getERC721MetadataAttribute(false, true, true, "", "Expression", _shrubSeedUris[_seedTokenId].expression);
        }

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
            // Added this to handle the case where there is no value
            if (bytes(attribute.value).length == 0) {
                continue;
            }

            bool insertComma = i < (attributes.length - 1) && !(i == 4 && bytes(attributes[5].value).length == 0);

            byteString = abi.encodePacked(
                byteString,
                _pushJsonArrayElement(_getAttribute(attribute), insertComma));
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
        require(seedIdInRange(_seedTokenId), "PaperPotMetadata: seedTokenId not in range");
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

    function getNftClassFromSeedId(uint256 _seedTokenId) private pure returns (NftClass) {
        require(seedIdInRange(_seedTokenId), "PaperPotMetadata: seedTokenId not in range");
        if (_seedTokenId > 1110) {
            return NftClass.wonder;
        }
        if (_seedTokenId > 110) {
            return NftClass.passion;
        }
        if (_seedTokenId > 10) {
            return NftClass.hope;
        }
        return NftClass.power;
    }

    function getDnaFromSeedId(uint256 _seedTokenId) private pure returns (uint256 dna) {
        require(seedIdInRange(_seedTokenId), "PaperPotMetadata: seedTokenId not in range");
        return _seedTokenId % 100;
    }

    function adminSetDefaultUris(string[4] memory shrubDefaultUris_) public adminOnly {
        // must be 4 uris - wonder, passion, hope, power
        for (uint8 i = 0; i < shrubDefaultUris_.length; i++) {
            _shrubDefaultUris[NftClass(i)] = shrubDefaultUris_[i];
        }
    }

    function setShrubSeedUris(uint[] calldata seedTokenIds_, CustomMetadata[] calldata metadatas_) external adminOnly {
        require(seedTokenIds_.length == metadatas_.length, "PaperPotMetadata: seedTokenIds and uris must be same length");
        for (uint i = 0; i < seedTokenIds_.length; i++) {
            require(seedTokenIds_[i] < POTTED_PLANT_BASE_TOKENID, "PaperPotMetadata: invalid seedTokenId");
            _shrubSeedUris[seedTokenIds_[i]] = metadatas_[i];
        }
    }

    function setShrubName(uint seedTokenId_, string memory newName_) external adminOnly {
        require(bytes(_shrubSeedUris[seedTokenId_].imageUri).length > 0, "PaperPotMetadata: Can only set name for already set Shrub");
        require(bytes(newName_).length < 27, "PaperPotMetadata: Maximum characters in name is 26.");
        require(validateMessage(newName_), "PaperPotMetadata: Invalid Name");
        _shrubSeedUris[seedTokenId_].name = newName_;
    }

    function validateMessage(string memory message_) public pure returns(bool) {
        // a-z,A-Z only
        bytes memory messageBytes = bytes(message_);
        if (messageBytes.length == 0) {
            // Length 0 is allow to revert
            return true;
        }

        // cannot begin or end with a space
        require(messageBytes.length > 0 && messageBytes[0] != 0x20 && messageBytes[messageBytes.length-1] != 0x20, "Invalid characters");

        for (uint i = 0; i < messageBytes.length; i++) {
            bytes1 char = messageBytes[i];
            if (!(char >= 0x41 && char <= 0x5A) && !(char >= 0x61 && char <= 0x7A) && char != 0x20) {
                revert("Invalid character");
            } else if (i >= 1 && char == 0x20 && messageBytes[i-1] == 0x20) {
                revert("Cannot have multiple sequential spaces");
            }
        }
        return true;
    }


}
