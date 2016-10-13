var http = require('http');
var q = require('q');
var serverDispatcher = require('./dispatcher');
var getPostPayload = require('./core/get-post-payload');
var topologyManager = require('./core/topology-manager');
var postgresDb = require('./dao/postgres-client');

var server = http.createServer(requestHandler);

function startServer() {
	var port = process.env.PORT || 9333;
	
	server.listen(port, function () {
	    console.log(`Server listening on: ${port}`);
	});

	// TODO: init management
	return q.all([serverDispatcher.start(), postgresDb.init(process.env.DATABASE_URL)]);
}

function requestHandler(request, response) {
	try {
  		response.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_BASE_DOMAIN || 'http://localhost:5000');
  		response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		if (request.method === 'POST') {
			var getPostAndDispatchPromise =
				getPostPayload(request)
					.then(dataAsString => {
						return serverDispatcher.request(request.url, dataAsString);
					});
			onDispatcherPromise(
				response,
				getPostAndDispatchPromise
			);
		} else if (request.method === 'GET') {
			//	TODO: get query string params(?)
			onDispatcherPromise(
				response,
				serverDispatcher.request(request.url, '{}')
			);
		}
	} catch (err) {
		rejectOnError(response, err);
	}
}

function onDispatcherPromise(response, promise) {
	promise
		.then(responseData => {
			response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(responseData));
		})
		.catch(err => {
			rejectOnError(response, err);
		});

}

function rejectOnError(response, additionalData) {
  var errorMessage = additionalData || 'Unknown Error';
  console.log(errorMessage);

  response.writeHead(502, {'Content-Type': 'application/json'});
  response.end(JSON.stringify({"error": errorMessage}));
}

function isAlive() {
	return server.listening
	&& serverDispatcher.isReady();
}

module.exports = {
	startServer: startServer,
	isAlive: isAlive
};
