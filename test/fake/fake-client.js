var http = require('http');
var q = require('q');

var server;

function requestHandler(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(makePageContent());
}

function startServer(port) {
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

function makePageContent() {
	return `
		<html>
			<head>
				<title>
					Client App
				</title>
			</head>
			<body>
				<header>
					HEADER
				</header>

				<div>
					Translate something...
				</div>
			</body>
		</html>	
	`;
}

module.exports = {
	start: startServer,
	stop: stopServer
};