// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract JsonBuilder {
    function _openJsonObject() internal pure returns (string memory) {
        return string(abi.encodePacked("{"));
    }

    function _closeJsonObject() internal pure returns (string memory) {
        return string(abi.encodePacked("}"));
    }

    function _openJsonArray() internal pure returns (string memory) {
        return string(abi.encodePacked("["));
    }

    function _closeJsonArray() internal pure returns (string memory) {
        return string(abi.encodePacked("]"));
    }

    function _pushJsonPrimitiveStringAttribute(string memory key, string memory value, bool insertComma) internal pure returns (string memory) {
        return string(abi.encodePacked('"', key, '": "', value, '"', insertComma ? ',' : ''));
    }

    function _pushJsonPrimitiveNonStringAttribute(string memory key, string memory value, bool insertComma) internal pure returns (string memory) {
        return string(abi.encodePacked('"', key, '": ', value, insertComma ? ',' : ''));
    }

    function _pushJsonComplexAttribute(string memory key, string memory value, bool insertComma) internal pure returns (string memory) {
        return string(abi.encodePacked('"', key, '": ', value, insertComma ? ',' : ''));
    }

    function _pushJsonArrayElement(string memory value, bool insertComma) internal pure returns (string memory) {
        return string(abi.encodePacked(value, insertComma ? ',' : ''));
    }
}
