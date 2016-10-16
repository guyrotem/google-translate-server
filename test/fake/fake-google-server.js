var http = require('http');
var q = require('q');
var url = require('url');

var answers = [];
var server;

function requestHandler(request, response) {
	var query = url.parse(request.url, true).query;
	console.log(query);

	var result = answers.find(function (ans) {
		return ans.req.q === query.q
		&& ans.req.tl === query.tl
		&& ans.req.sl === query.sl
		&& ans.req.tk === query.tk;
	});

	if (result) {
		var jsonContent = result.res;

		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(jsonContent);
	} else {
		response.writeHead(502, {'Content-Type': 'application/json'});
		response.end(JSON.stringify({error: "No match"}));
	}
}

function startGoogleServer(port) {
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

function makeResponse(translation, bestMatchQuery, transliteration, sourceLang) {
	sourceLang = sourceLang || 'auto';
	var jsonContent = [[[translation,bestMatchQuery,,,0],[,,transliteration]],,sourceLang,,,];
	return JSON.stringify(jsonContent);
}

function addTranslation(query, translation, tl, transliteration, synonyms, tk) {
	//	TODO: synonyms currently not supported
	answers.push({
		req: {
			q: query,
			sl: 'auto',
			tl: tl,
			tk: tk
		},
		res: makeResponse(translation, query, transliteration, 'auto')
	});
}

module.exports = {
	start: startGoogleServer,
	stop: stopServer,
	addTranslation: addTranslation
};