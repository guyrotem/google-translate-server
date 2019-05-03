var translateAPI = require('./core/translate-api.js');
var topologyManager = require('./core/topology-manager');
var postgresDb = require('./dao/postgres-client');
const q = require('q');

function start() {
	topologyManager.init();

	const shutdownHandles = [];

	return postgresDb.init(process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME, process.env.DB_PORT)
		.then(handle => shutdownHandles.push(handle))
		.then(() => translateAPI.init())
		.then(handle => shutdownHandles.push(handle))
		.then(() =>  {
			return {
				stop: () => shutdownHandles.forEach((handle) => {
					handle.close();
				})
			}
		});
}

module.exports = {
	start: start
};
