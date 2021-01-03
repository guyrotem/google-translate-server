const server = require('./scripts/run-server');
const setProductionTopology = require('./set-production-topology');

require('./scripts/load-dot-env')();

setProductionTopology()
	.then(() => {
		server.startServer();
	})
	.catch((err) => {
		console.log(err);
		process.exit();
	});
