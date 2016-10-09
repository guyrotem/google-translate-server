var extend = require('extend');
var configBaseDir = './../../conf';

var publicConfig = require(configBaseDir + '/config.json');
var privateConfig = loadPrivateConfig(configBaseDir + '/config.private.json');

function loadPrivateConfig(filePath) {
	try {
		return require(filePath);
	} catch(e) {
		return {};
	}
}

module.exports = extend.bind(null, publicConfig, privateConfig);
