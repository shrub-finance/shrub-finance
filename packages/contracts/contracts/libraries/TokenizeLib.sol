pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../MintBurnToken.sol";
import "./AppStateLib.sol";
import "./OrderLib.sol";

library TokenizeLib {
  using OrderLib for OrderLib.OrderCommon;
  using AppStateLib for AppStateLib.AppState;
  using AppStateLib for AppStateLib.ExposureType;
  using AppStateLib for AppStateLib.PositionToken;

  function tokenizePosition(AppStateLib.AppState storage self, uint256 size, OrderLib.OrderCommon memory common) public {
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    int exposure = self.userOptionPosition[msg.sender][positionHash];
    require(exposure != 0, "Must have an open position to tokenize");
    if(exposure > 0) {
      // we are tokenizing a long position
      require(exposure <= int(size));

      MintBurnToken token;
      if(self.groupCommonToken[AppStateLib.ExposureType.LONG][positionHash] == OrderLib.ZERO_ADDRESS) {
        string memory tokenName = string(abi.encodePacked("SHRUB-LONG: ", positionHash));
        token = new MintBurnToken(tokenName, "SHRUB-LONG");
        address tokenAddress = address(token);
        self.groupCommonToken[AppStateLib.ExposureType.LONG][positionHash] = tokenAddress;
        self.positionTokenInfo[tokenAddress] = AppStateLib.PositionToken({
          exposureType: AppStateLib.ExposureType.LONG,
          token: tokenAddress,
          common: common
        });
      } else {
        token = MintBurnToken(self.groupCommonToken[AppStateLib.ExposureType.LONG][positionHash]);
      }

      self.userOptionPosition[msg.sender][positionHash] -= int(size);
      token.mint(msg.sender, size);
    } else {
      revert("ShrubExchange: tokenizing short positions not implemented yet");
    }
  }

  function unwrapPositionToken(AppStateLib.AppState storage self, address tokenAddress, uint256 size) public {
    AppStateLib.PositionToken storage tokenInfo = self.positionTokenInfo[tokenAddress];
    require(tokenInfo.token == tokenAddress, "ShrubExchange: Cannot unwrap a token not deployed by Shrub");

    bytes32 positionHash = OrderLib.hashOrderCommon(tokenInfo.common);

    MintBurnToken token = MintBurnToken(tokenAddress);
    token.burn(msg.sender, size);

    if(tokenInfo.exposureType == AppStateLib.ExposureType.LONG) {
      self.userOptionPosition[msg.sender][positionHash] += int(size);
    }
  }
}
