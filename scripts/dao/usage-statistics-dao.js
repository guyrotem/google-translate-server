var q = require('q');
var sqlDriver = require('./postgres-client');
var actionsQueue = require('../queue/actions-queue');
var queue = new actionsQueue();

var getStatistics = (url) => `SELECT * FROM usage_statistics WHERE url = '${url}'`;
var addStatistics = (url, count) => `INSERT INTO usage_statistics (count, url) VALUES(${count + 1}, '${url}')`;
var updateStatistics = (url, count) => `UPDATE usage_statistics SET count = ${count + 1} WHERE url = '${url}'`;

var incrementUsageCountOp = (url) => {
	var deferred = q.defer();
	var client = sqlDriver.getClient();
	var select = `SELECT * FROM usage_statistics WHERE url = '${url}'`;

	client.query(select, [], function (err, result) {
		if (err) {
			console.log(err);
			return deferred.reject(err);
		}

		var urlCount, addQuery;
		if (result.rows.length > 0) {
			urlCount = parseInt(result.rows[0].count, 10) || 1;	
			addQuery = updateStatistics(url, urlCount);
		} else {
			urlCount = 0;
			addQuery = addStatistics(url, urlCount);
		}

		client.query(addQuery, [], (err, res) => {
			deferred.resolve();
		});
	});
	return deferred.promise;
}

function incrementUsageCount(url) {
	queue.runLater(incrementUsageCountOp, [url]);
}

module.exports = {
	incrementUsageCount: incrementUsageCount
};