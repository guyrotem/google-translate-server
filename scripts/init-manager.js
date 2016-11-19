var translateAPI = require('./core/translate-api.js');
var topologyManager = require('./core/topology-manager');
var postgresDb = require('./dao/postgres-client');

function start() {
	topologyManager.init();

	return postgresDb.init(process.env.DATABASE_URL)
		.then(() => translateAPI.init());
}

module.exports = {
	start: start
}
