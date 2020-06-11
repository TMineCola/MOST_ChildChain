const crosschain_tx = artifacts.require("CrosschainTransaction.sol");
module.exports = function(deployer) {
  deployer.deploy(crosschain_tx);
};
