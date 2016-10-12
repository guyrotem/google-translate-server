var pg = require('pg');
var q = require('q');

var pgClient;

function init(databaseUrl) {
	var deferred = q.defer();

	pg.defaults.ssl = false;
	pg.connect(databaseUrl || 'postgres:///google_translate_server', function(err, client) {
	  if (err) {
	  	return q.reject(err);
	  };

	  console.log('Connected to postgres! Getting schemas...');
	  pgClient = client;

	  deferred.resolve();

	  client
	  	.query('SELECT * FROM usage_statistics;')
	  	.on('row', function(row) {
	      console.log(JSON.stringify(row));
	    });
	});

	return deferred.promise;
}


module.exports = {
	init: init,
	getClient: () => pgClient
}