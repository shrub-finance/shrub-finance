pragma solidity 0.8.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../MintBurnToken.sol";
import "./AppStateLib.sol";
import "./OrderLib.sol";
import "hardhat/console.sol";

library TokenizeLib {
  using OrderLib for OrderLib.OrderCommon;
  using AppStateLib for AppStateLib.AppState;
  using AppStateLib for AppStateLib.ExposureType;
  using AppStateLib for AppStateLib.PositionToken;

  function tokenizePosition(AppStateLib.AppState storage self, uint256 size, OrderLib.OrderCommon memory common) internal {
    console.log('tokenizePosition');
    bytes32 positionHash = OrderLib.hashOrderCommon(common);
    int exposure = self.userOptionPosition[msg.sender][positionHash];

    require(exposure != 0, "Must have an open position to tokenize");
    if(exposure > 0) {
      require(exposure >= int(size));
      // we are tokenizing a long position

      MintBurnToken token;
      if(self.positionTokenAddress[AppStateLib.ExposureType.LONG][positionHash] == OrderLib.ZERO_ADDRESS) {
        string memory tokenName = string(abi.encodePacked("SHRUB-LONG: ", positionHash));
        token = new MintBurnToken(tokenName, "SHRUB-LONG");
        address tokenAddress = address(token);
        self.positionTokenAddress[AppStateLib.ExposureType.LONG][positionHash] = tokenAddress;
        self.positionTokenInfo[tokenAddress] = AppStateLib.PositionToken({
          exposureType: AppStateLib.ExposureType.LONG,
          token: tokenAddress,
          common: common
        });
      } else {
        token = MintBurnToken(self.positionTokenAddress[AppStateLib.ExposureType.LONG][positionHash]);
      }

      self.userOptionPosition[msg.sender][positionHash] -= int(size);
      token.mint(msg.sender, size);
    } else if(exposure < 0) {
      require(exposure * -1 >= int(size));
      // we are tokenizing a short position

      MintBurnToken token;
      if(self.positionTokenAddress[AppStateLib.ExposureType.SHORT][positionHash] == OrderLib.ZERO_ADDRESS) {
        string memory tokenName = string(abi.encodePacked("SHRUB-SHORT: ", positionHash));
        token = new MintBurnToken(tokenName, "SHRUB-SHORT");
        address tokenAddress = address(token);
        self.positionTokenAddress[AppStateLib.ExposureType.SHORT][positionHash] = tokenAddress;
        self.positionTokenInfo[tokenAddress] = AppStateLib.PositionToken({
          exposureType: AppStateLib.ExposureType.SHORT,
          token: tokenAddress,
          common: common
        });
      } else {
        token = MintBurnToken(self.positionTokenAddress[AppStateLib.ExposureType.SHORT][positionHash]);
      }

      self.userOptionPosition[msg.sender][positionHash] += int(size);
      token.mint(msg.sender, size);
    }
  }

  function unwrapPositionToken(AppStateLib.AppState storage self, address tokenAddress, uint256 size) internal {
    console.log('unwrapPositionToken');
    AppStateLib.PositionToken storage tokenInfo = self.positionTokenInfo[tokenAddress];
    require(tokenInfo.token == tokenAddress, "ShrubExchange: Cannot unwrap a token not deployed by Shrub");

    bytes32 positionHash = OrderLib.hashOrderCommon(tokenInfo.common);

    MintBurnToken token = MintBurnToken(tokenAddress);
    token.burn(msg.sender, size);

    if(tokenInfo.exposureType == AppStateLib.ExposureType.LONG) {
      self.userOptionPosition[msg.sender][positionHash] += int(size);
    } else if(tokenInfo.exposureType == AppStateLib.ExposureType.SHORT) {
      self.userOptionPosition[msg.sender][positionHash] -= int(size);
    }
  }
}
