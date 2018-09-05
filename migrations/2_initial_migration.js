var Safe = artifacts.require("./Safe.sol");

module.exports = function(deployer, network, accounts) {
  const userAddress_0 = accounts[0];
  const userAddress_1 = accounts[1];
  const userAddress_2 = accounts[2];
  const userAddress_3 = accounts[3];
  deployer.deploy(Safe, userAddress_0,userAddress_1,userAddress_2,userAddress_3);
};
