pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

library TokenizeLib {
  using OrderLib for OrderLib.OrderCommon;

  enum ExposureType {
    SHORT,
    LONG
  }

  struct PositionToken {
    ExposureType exposureType;
    address token;
    OrderCommon common;
  }

  function tokenizePosition(uint256 size, OrderCommon memory common) public {
    bytes32 positionHash = hashOrderCommon(common);
    int exposure = userOptionPosition[msg.sender][positionHash];
    require(exposure != 0, "Must have an open position to tokenize");
    if(exposure > 0) {
      // we are tokenizing a long position
      require(exposure <= int(size));

      MintBurnToken token;
      if(groupCommonToken[ExposureType.LONG][positionHash] == ZERO_ADDRESS) {
        string memory tokenName = string(abi.encodePacked("SHRUB-LONG: ", positionHash));
        token = new MintBurnToken(tokenName, "SHRUB-LONG");
        address tokenAddress = address(token);
        groupCommonToken[ExposureType.LONG][positionHash] = tokenAddress;
        positionTokenInfo[tokenAddress] = PositionToken({
          exposureType: ExposureType.LONG,
          token: tokenAddress,
          common: common
        });
      } else {
        token = MintBurnToken(groupCommonToken[ExposureType.LONG][positionHash]);
      }

      userOptionPosition[msg.sender][positionHash] -= int(size);
      token.mint(msg.sender, size);
    } else {
      revert("ShrubExchange: tokenizing short positions not implemented yet");
    }
  }

  function unwrapPositionToken(address tokenAddress, uint256 size) public {
    PositionToken storage tokenInfo = positionTokenInfo[tokenAddress];
    require(tokenInfo.token == tokenAddress, "ShrubExchange: Cannot unwrap a token not deployed by Shrub");

    bytes32 positionHash = hashOrderCommon(tokenInfo.common);

    MintBurnToken token = MintBurnToken(tokenAddress);
    token.burn(msg.sender, size);

    if(tokenInfo.exposureType == ExposureType.LONG) {
      userOptionPosition[msg.sender][positionHash] += int(size);
    }
  }
}
