var q = require('q');
var postgresClient = require('./postgres-client');

var getUserQuery = (username) => `SELECT * FROM user_info WHERE username = '${username}'`;
var createNewUserQuery = (url, lastCount) => `INSERT INTO user_info (username, hash) VALUES('${username}', '${hash}')`;

module.exports.getUser = (username) => {
	var client = postgresClient.getClient();
	var select = getUserQuery(username);
	var deferred = q.defer();
	
	client.query(select, [], function (err, result) {
		if (err) {
			return deferred.reject(err);
		}

		if (result.rows.length > 0) {
			deferred.resolve(result.rows[0]);
		} else {
			deferred.reject('User not found: ' + username);
		}

	});

	return deferred.promise;
};

module.exports.createNewUser = (username, hash) => {
	var client = postgresClient.getClient();
	var select = createNewUserQuery(username, hash);
	var deferred = q.defer();

	client.query(select, [], function (err, result) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(result);
		}
	});

	return deferred.promise;
}
