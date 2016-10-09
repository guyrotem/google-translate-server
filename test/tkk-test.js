var request = require('request-promise');
var q = require('q');
var env = require('./environment');

function runTest() {
	var translateQuery = {
		query: 'dog',
		sourceLang: 'auto',
		targetLang: 'fr'
	};
	var serverBaseDomain = 'http://localhost:9333';	//	TODO: from topology

	var options = {
	    method: 'POST',
	    uri: serverBaseDomain + '/translate',
	    body: translateQuery,
	    json: true
	};

	request(options)
		.then(data => {
			console.log(data);
			process.exit();
		})
		.catch(err => {
			console.log(err.error);
			process.exit();
		});
}

env.copyTopology()
	.then(env.start)
	.then(runTest);
