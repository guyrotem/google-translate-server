var pg = require('pg');
var q = require('q');

var pgClient;

function init(databaseUrl) {
	var deferred = q.defer();

	if (process.env.ENABLE_PSQL === 'true') {
		pg.defaults.ssl = false;
		pg.connect(databaseUrl, function(err, client) {
			if (err) {
				console.error('\nFAILED to connect to POSTGRES database. Make sure it is up!\n');
				return deferred.reject(err);
			} else {
				pgClient = client;
				createSchemas();
				console.log('Connected to PostgreSQL!');
				printAllStatistics();
				deferred.resolve();
			}
		});
	} else {
		pgClient = new PgClientMock();
		deferred.resolve('MOCK');
	}

	return deferred.promise;
}

function createSchemas() {
	var query1 = 'CREATE TABLE IF NOT EXISTS usage_statistics (url varchar(50) NOT NULL, count integer NOT NULL);';
	var query2 = 'CREATE TABLE IF NOT EXISTS user_info (username varchar(50) NOT NULL, hash varchar(50) NOT NULL);';
	var query3 = 'CREATE TABLE IF NOT EXISTS tkk_history (key varchar(32) NOT NULL, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);';
	pgClient.query(query1);
	pgClient.query(query2);
	pgClient.query(query3);
}

function printAllStatistics() {
	pgClient
	  	.query('SELECT * FROM usage_statistics;')
	  	.on('row', function(row) {
	      console.log(JSON.stringify(row));
	    });
}

function PgClientMock() {}

PgClientMock.prototype.query = function (a, b, callback) {
	callback(null, {rows: []});
};


module.exports = {
	init: init,
	getClient: () => pgClient
}