var PD = artifacts.require("./pedersenCommitment.sol");
module.exports = function(deployer) {
  deployer.deploy(PD);
};
