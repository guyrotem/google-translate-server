var productionSettings;

function readTopology() {
	return productionSettings;
}

function init() {
	productionSettings = require('./../../.conf/topology.json');
	console.log('Topology initialized with:');
	console.log(productionSettings);
}

module.exports = {
	init: init,
	readTopology: readTopology
}