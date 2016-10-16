var q = require('q');

var fakeTkkServer = require('./fake-tkk-server');
var fakeGoogleServer = require('./fake-google-server');
var fakeTtsServer = require('./fake-tts-server');
var fakeClientExpressServer = require('./fake-client');
var fakeTkkPort = 9445;	//	TODO: from topology
var fakeGooglePort = 9444;	//	TODO: from topology
var fakeTtsPort = 9443;	//
var fakeClientPort = 5000;	//	NOTE: from env variables

function startAll() {
	var fakeServerPromise = fakeTkkServer.start(fakeTkkPort)
		.then(data => {
			console.log('Fake TKK server started!');
		});
	var fakeGooglePromise = fakeGoogleServer.start(fakeGooglePort)
		.then(data => {
			console.log('Fake Google server started!');
		});
	var fakeTtsPromise = fakeTtsServer.start(fakeTtsPort)
		.then(data => {
			console.log('Fake TTS server started!');
		});
	var fakeClientPromise = fakeClientExpressServer.start(fakeClientPort)
		.then(data => {
			console.log('Fake Client started!');
		});

	return q.all([fakeServerPromise, fakeGooglePromise, fakeTtsPromise, fakeClientPromise]);
}

function stopAll() {
	return q.all([
		fakeTkkServer.stop(),
		fakeTtsServer.stop(),
		fakeGoogleServer.stop(),
		fakeClientExpressServer.stop()
	]);
}

module.exports = {
	startAll: startAll,
	stopAll: stopAll,
	servers: {
		googleApiServer: fakeGoogleServer,
		googleTkkServer: fakeTkkServer,
		googleTtsServer: fakeTtsServer,
		clientFileServer: fakeClientExpressServer
	}
}