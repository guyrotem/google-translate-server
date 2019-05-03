var translateAPI = require('./core/translate-api.js');
var topologyManager = require('./core/topology-manager');
var postgresDb = require('./dao/postgres-client');
const q = require('q');

function start() {
	topologyManager.init();

	return q.all([
		postgresDb.init(process.env.DATABASE_URL),
		translateAPI.init()
	]).then((closeHandlers => {
		return {
			stop: () => closeHandlers.forEach((handle) => { handle.close(); })
		}
	}));
}

module.exports = {
	start: start
};
