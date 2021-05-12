const FakeToken = artifacts.require("FakeToken");

module.exports = function (deployer) {
  deployer.deploy(FakeToken);
};
