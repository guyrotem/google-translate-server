const pg = require('pg');
const q = require('q');

var pgClient;

function init(connectionString) {
	const deferred = q.defer();
	if (process.env.ENABLE_PSQL === 'true') {
		pg.defaults.ssl = false;
		pgClient = new pg.Client({connectionString: connectionString});

		pgClient.connect(function(err) {
			if (err) {
				console.error('\nFAILED to connect to POSTGRES database. Make sure it is up!\n');
				console.error(err);
				return deferred.reject(err);
			} else {
				createSchemas();
				console.log('Connected to PostgreSQL!');
				printAllStatistics();
				deferred.resolve({close: () => pgClient.end()});
			}
		});
	} else {
		pgClient = new PgClientMock();
		deferred.resolve({close: () => {}});
	}

	return deferred.promise;
}

function createSchemas() {
	const query1 = 'CREATE TABLE IF NOT EXISTS usage_statistics (url varchar(50) NOT NULL, count integer NOT NULL);';
	const query2 = 'CREATE TABLE IF NOT EXISTS user_info (username varchar(50) NOT NULL, hash varchar(50) NOT NULL);';
	const query3 = 'CREATE TABLE IF NOT EXISTS tkk_history (key varchar(32) NOT NULL, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);';
	pgClient.query(query1);
	pgClient.query(query2);
	pgClient.query(query3);
}

function printAllStatistics() {
	pgClient
	  	.query('SELECT * FROM usage_statistics;')
	  	.then(function(response) {
	      console.log(JSON.stringify(response.rows));
	    });
}

function PgClientMock() {}

PgClientMock.prototype.query = function (a, b, callback) {
	callback(null, {rows: []});
};


module.exports = {
	init: init,
	getClient: () => pgClient
};