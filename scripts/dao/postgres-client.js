var pg = require('pg');
var q = require('q');

var pgClient;

function init(databaseUrl) {
	var deferred = q.defer();

	pg.defaults.ssl = false;
	pg.connect(databaseUrl, function(err, client) {
		if (err) {
			console.log('FAILED to connect to POSTGRES database. Make sure it is up!');
			return deferred.reject(err);
		} else {
			pgClient = client;
			console.log('Connected to PostgreSQL!');
			printAllStatistics();
			deferred.resolve();
		}
	});

	return deferred.promise;
}

function printAllStatistics() {
	pgClient
	  	.query('SELECT * FROM usage_statistics;')
	  	.on('row', function(row) {
	      console.log(JSON.stringify(row));
	    });
}


module.exports = {
	init: init,
	getClient: () => pgClient
}