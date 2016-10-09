var http = require('http');
var q = require('q');
var serverDispatcher = require('./dispatcher.js');
var getPostPayload = require('./core/get-post-payload.js');

var server = http.createServer(requestHandler);

function startServer() {
	var port = process.env.npm_package_config_port || 9333;
	
	server.listen(port, function () {
	    console.log(`Server listening on: ${port}`);
	});

	return serverDispatcher.start();
}

function requestHandler(request, response) {
	try {
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