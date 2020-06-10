const crosschain_tx = artifacts.require("CrosschainTransaction.sol");
const nameServer = artifacts.require("NamingService.sol");
module.exports = function(deployer) {
  deployer.deploy(crosschain_tx);
  deployer.deploy(nameServer);
};
