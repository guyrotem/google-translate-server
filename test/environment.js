var q = require('q');
var fs = require('fs');
var tkHash = require('./../scripts/hash/tk-hash');
var mockServers = require('./fake/mock-servers');

function runMocks() {
	var mockServerAlive = setupMocks();
	var serverAlive = startServer();

	return q.all([mockServerAlive, serverAlive]);
}

function stop() {
	return mockServers.stopAll();
}

function startServer() {
	return require(__dirname + './../scripts/run-server').startServer();
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