var q = require('q');
var fs = require('fs');
var tkHash = require('./../scripts/hash/tk-hash');
var mockServers = require('./fake/mock-servers');
var serverFactory = require('./../scripts/run-server');
var server;

function runMocks() {
	const collaborators = setupMocks();
	server = serverFactory.startServer();

	return q.all([collaborators, server]);
}

function stop() {
	return server.then(closeHandler => {
		return q.all([closeHandler.stop(), mockServers.stopAll()]);
	});
}

function setupMocks() {
	var mockData = require('./data.json');
	mockData.entries.forEach(entry => {
		var tk = tkHash(entry.query, mockData.tkk);

		mockServers.servers.googleApiServer.addTranslation(
				entry.query,
				entry.translation,
				entry.language,
				entry.transliteration,
				entry.synonyms,
				tk
			);
	});

	mockData.tts.forEach(ttsEntry => {
		var tk = tkHash(ttsEntry.query, mockData.tkk);
		mockServers.servers.googleTtsServer.addEntry(
				ttsEntry.query,
				ttsEntry.language,
				ttsEntry.audio,
				tk
			);
	});

	mockServers.servers.googleTkkServer.setTkk(mockData.tkk);

	return mockServers.startAll();
}

function copyFakeTopology() {
	var deferred = q.defer();

	if (!fs.existsSync('.conf')) {
	    fs.mkdirSync('.conf');
	}

	var cp = fs.createReadStream('test/conf/topology.fake.json').pipe(fs.createWriteStream('./.conf/topology.json'));

	cp.on('error', deferred.reject);
	cp.on('close', deferred.resolve);

	require(__dirname + './../scripts/load-dot-env')();
	return deferred.promise;
}

module.exports = {
	start: runMocks,
	stop: stop,
	copyTopology: copyFakeTopology
};