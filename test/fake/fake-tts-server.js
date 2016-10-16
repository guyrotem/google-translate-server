var http = require('http');
var q = require('q');
var url = require('url');
var fs = require('fs-promise');

var answers = [];
var server;

function requestHandler(request, response) {

	var query = url.parse(request.url, true).query;
	console.log(query);

	var result = answers.find(function (ans) {
		return ans.q === query.q
		&& ans.tl === query.tl
		&& ans.tk === query.tk;
	});

	if (result) {
		fs.readFile('test/' + result.audio)
			.then(audioData => {
				response.writeHead(200, {'Content-Type': 'audio/mpeg', 'alt-svc': 'quic=":443"; ma=2592000; v="36,35,34,33,32"'});
				response.end(audioData, 'binary');
			})
			.catch(err => {
				response.writeHead(502, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({error: 'Failed to open audio file: ' + result.audio}));		
			})
	} else {
		response.writeHead(502, {'Content-Type': 'application/json'});
		response.end(JSON.stringify({error: 'No TTS data for requested word or invalid key'}));
	}
}

function addEntry(query, language, audio, tk) {
	answers.push(
	{
		q: query,
		tl: language,
		audio: audio,
		tk: tk
	}
		);
}

function startTtsServer(port) {
	var deferred = q.defer();
	server = http.createServer(requestHandler);

	server.listen(port, function () {
		deferred.resolve();
	});

	return deferred.promise;
}

function stopServer() {
	var deferred = q.defer();

	server.close(() => {
		deferred.resolve();
	});

	return deferred.promise;
}

module.exports = {
	start: startTtsServer,
	stop: stopServer,
	addEntry: addEntry
};