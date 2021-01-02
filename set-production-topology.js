const fs = require('fs');
const q = require('q');

function setProductionTopology() {
	const deferred = q.defer();

	if (!fs.existsSync('.conf')) {
	    fs.mkdirSync('.conf');
	}

	const cp = fs.createReadStream('./scripts/conf/topology.production.json')
		.pipe(fs.createWriteStream('./.conf/topology.json'));

	cp.on('close', () => {
		deferred.resolve();
	});

	cp.on('err', err => {
		console.error(err);
		deferred.reject(err);
	});

	return deferred.promise;
}

module.exports = setProductionTopology;