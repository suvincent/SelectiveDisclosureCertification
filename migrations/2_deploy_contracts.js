var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Drvie = artifacts.require("./Drive.sol");

module.exports = function(deployer) {
  deployer.deploy(Drvie);
};
