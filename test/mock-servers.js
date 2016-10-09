var q = require('q');

var fakeTkkServer = require('./fake-tkk-server');
var fakeGoogleServer = require('./fake-google-server');
var fakeTkkPort = 9445;	//	TODO: from topology
var fakeGooglePort = 9444;	//	TODO: from topology

function startAll() {
	var fakeServerPromise = fakeTkkServer.start(fakeTkkPort)
		.then(data => {
			console.log('Fake TKK server started!');
		});
	var fakeGooglePromise = fakeGoogleServer.start(fakeGooglePort)
		.then(data => {
			console.log('Fake Google server started!');
		});

	return q.all([fakeServerPromise, fakeGooglePromise]);
}

module.exports = {
	startAll: startAll,
	servers: {
		googleApiServer: fakeGoogleServer,
		googleTkkServer: fakeTkkServer
	}
}