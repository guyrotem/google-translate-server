var http = require('http');
var serverDispatcher = require('./dispatcher');
var getPostPayload = require('./core/get-post-payload');
var requestModule = require('request');
var querystring = require('querystring');

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
		//	TODO: need to be able to tell between JSON apis, media APIs, HTML...
  		if (request.url === '/') {
  			proxyTo(process.env.CLIENT_BASE_DOMAIN + '/statics/', request, response);
  		} else if (request.method === 'POST') {
			var getPostAndDispatchPromise =
				getPostPayload(request)
					.then(dataAsString => {
						return serverDispatcher.request(request.url, dataAsString);
					});
			onDispatcherPromise(
				0,
				request,
				response,
				getPostAndDispatchPromise
			);
		} else if (request.method === 'GET') {
			//	TODO: get query string params(?)
			var url = request.url.split('?')[0];
			var search = request.url.split('?')[1];
			var data = JSON.stringify(querystring.parse(search));

			onDispatcherPromise(
				url === '/api/tts' ? 1 : 0,
				request,
				response,
				serverDispatcher.request(url, data)
			);
		}
	} catch (err) {
		rejectOnError(response, err);
	}
}

function proxyTo(url, request, response) {
	console.log('Proxying to ' + url);
	request
		.pipe(requestModule(url))
		.pipe(response);
}

function onDispatcherPromise(action, request, response, promise) {
	headers = {'Content-Type': 'application/json'};

	if (action === 1) {
		request
			.pipe(promise)
			.pipe(response);
	} else {
		promise
			.then(responseData => {
				response.writeHead(200, headers);
	            response.end(JSON.stringify(responseData));
			})
			.catch(err => {
				rejectOnError(response, err);
			});
	}
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
