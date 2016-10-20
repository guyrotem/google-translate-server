var q = require('q');
var sqlDriver = require('./postgres-client');
var actionsQueue = require('../queue/actions-queue');
var queue = new actionsQueue();

var getStatistics = (url) => `SELECT * FROM usage_statistics WHERE url = '${url}'`;
var addStatistics = (url, lastCount) => `INSERT INTO usage_statistics (count, url) VALUES(${lastCount + 1}, '${url}')`;
var updateStatistics = (url, lastCount) => `UPDATE usage_statistics SET count = ${lastCount + 1} WHERE url = '${url}'`;

function incrementUsageCountOp(url) {
	var deferred = q.defer();
	var client = sqlDriver.getClient();
	var select = getStatistics(url);

	client.query(select, [], function (err, result) {
		if (err) {
			console.log(err);
			return deferred.reject(err);
		}

		var urlCount, addQuery;
		if (result.rows.length > 0) {
			lastCount = parseInt(result.rows[0].count, 10) || 1;	
			addQuery = updateStatistics(url, lastCount);
		} else {
			lastCount = 0;
			addQuery = addStatistics(url, lastCount);
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