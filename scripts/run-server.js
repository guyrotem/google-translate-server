var express = require('express');
var bodyParser = require('body-parser');
var serverDispatcher = require('./dispatcher');
var getPostPayload = require('./core/get-post-payload');
var urlModule = require('url');
var initManager = require('./init-manager');
var q = require('q');

const app = express();

function startServer() {
	const port = process.env.PORT;

	//var jsonParser = bodyParser.json();
	//app.use(bodyParser.json());

	//	TODO: use express...
	app.get('/', requestHandler);
	app.get('/robots.txt', requestHandler);
	app.get('/api/*', requestHandler);
	app.post('/api/*', requestHandler);

	const closeHandle = app.listen(port, function () {
		console.log(`Server listening on: ${port}`);
	});

	return initManager.start().then(() => {
		return {
			stop: () => {
				const deferred = q.defer();

				closeHandle.close(() => {
					deferred.resolve();
				});

				return deferred.promise;
			}
		}
	});
}

//	TODO: replace it with express
function requestHandler(request, response) {
	try {
  		if (request.method === 'POST') {
			getPostPayload(request)
				.then(dataAsString => {
					var url = request.url;
					var data = JSON.parse(dataAsString);
					var dispatcherResult = serverDispatcher.request(url, data);

					handleDispatcherResult(
						request,
						response,
						dispatcherResult
					);
				});
		} else if (request.method === 'GET') {
			var url = request.url.split('?')[0];
			var data = urlModule.parse(request.url, true).query;
			var dispatcherResult = serverDispatcher.request(url, data);

			handleDispatcherResult(
				request,
				response,
				dispatcherResult
			);
		} else {
			rejectOnError(response, `Unknown method ${request.method}`);
		}
	} catch (err) {
		rejectOnError(response, err);
	}
}

function handleDispatcherResult(request, response, dispatcherResult) {
	console.info('Result type: ' + dispatcherResult.type);

	var action = dispatcherResult.type;
	var data = dispatcherResult.data;
	var contentType = dispatcherResult.contentType || 'application/json';

	if (action === 'PROXY') {
		request
			.pipe(data)
			.pipe(response);

	} else if (action === 'PROMISE/TEXT') {
		var header = {'Content-Type': contentType};

		data
			.then(responseData => {
				response.writeHead(200, header);
	            response.end(JSON.stringify(responseData));
			})
			.catch(err => {
				rejectOnError(response, err);
			});
	} else {
		rejectOnError(response, `Unknown action: ${action}`);
	}
}

function rejectOnError(response, additionalData) {
  var errorMessage = additionalData || 'Unknown Error';
  console.error(errorMessage);

  response.writeHead(503, {'Content-Type': 'application/json'});
  response.end(JSON.stringify({error: errorMessage}));
}

function isAlive() {
	return server.listening
	&& initManager.isReady();
}

module.exports = {
	startServer: startServer,
	isAlive: isAlive
};
