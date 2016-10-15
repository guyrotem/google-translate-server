var http = require('http');
var serverDispatcher = require('./dispatcher');
var getPostPayload = require('./core/get-post-payload');
var requestModule = require('request');

var server = http.createServer(requestHandler);

function startServer() {
	require('./load-dot-env')();

	var port = process.env.PORT;
	
	server.listen(port, function () {
	    console.log(`Server listening on: ${port}`);
	});

	return require('./init-manager')
		.start();
}

function requestHandler(request, response) {
	try {
  		response.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_BASE_DOMAIN);
  		response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  		if (request.url === '/') {
  			request
  				.pipe(requestModule(process.env.CLIENT_BASE_DOMAIN))
  				.pipe(response);
  		} else if (request.method === 'POST') {
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
  response.end(JSON.stringify({error: errorMessage}));
}

function isAlive() {
	return server.listening
	&& serverDispatcher.isReady();
}

module.exports = {
	startServer: startServer,
	isAlive: isAlive
};
