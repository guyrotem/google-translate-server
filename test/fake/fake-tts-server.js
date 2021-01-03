const http = require('http');
const q = require('q');
const url = require('url');
const fs = require('fs');

const answers = [];
let server;

function requestHandler(request, response) {

	const query = url.parse(request.url, true).query;
	console.log(query);

	const result = answers.find(function (ans) {
		return ans.q === query.q
			&& ans.tl === query.tl
			&& ans.tk === query.tk;
	});

	if (result) {
		fs.promises.readFile('test/' + result.audio)
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
	const deferred = q.defer();
	server = http.createServer(requestHandler);

	server.listen(port, function () {
		deferred.resolve();
	});

	return deferred.promise;
}

function stopServer() {
	const deferred = q.defer();

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