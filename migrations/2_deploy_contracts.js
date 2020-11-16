// Import Contract 
const Dbox = artifacts.require("Dbox");

module.exports = function (deployer) {
	deployer.deploy(Dbox);
};
