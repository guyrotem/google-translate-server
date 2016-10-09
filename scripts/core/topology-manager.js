var productionSettings;

function readTopology() {
	return productionSettings;
}

function init() {
	productionSettings = require('./../../.conf/topology.json');
}

module.exports = {
	init: init,
	readTopology: readTopology
}