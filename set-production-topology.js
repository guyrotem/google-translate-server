var fs = require('fs');
var q = require('q');

function setProductionTopology() {
	var deferred = q.defer();

	if (!fs.existsSync('.conf')) {
	    fs.mkdirSync('.conf');
	}

	var cp = fs.createReadStream('./scripts/conf/topology.production.json')
			.pipe(fs.createWriteStream('./.conf/topology.json'));

	cp.on('close', () => {
		deferred.resolve();
	});

	cp.on('err', err => {
		console.log(err);
		deferred.reject(err);
	});

	return deferred.promise;
}

module.exports = setProductionTopology;