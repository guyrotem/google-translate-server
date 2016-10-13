var pg = require('pg');
var q = require('q');

var pgClient;

function init(databaseUrl) {
	var deferred = q.defer();

	pg.defaults.ssl = false;
	pg.connect(databaseUrl || 'postgres:///google_translate_server', function(err, client) {
		if (err) {
			deferred.reject(err);
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