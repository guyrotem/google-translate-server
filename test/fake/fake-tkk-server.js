// var tkk = '123456.83426423';
var http = require('http');
var q = require('q');
var tkk = null;
var server;

function requestHandler(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(makePageContent());
}

function startTkkServer(port) {
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
					Fake TKK
				</title>
			</head>
			<body>
				<script>
					window.TKK = ${tkk}
				</script>
			</body>
		</html>	
	`;
}

function setTkk(newTkk) {
	tkk = "\"" + newTkk + "\"";
}

module.exports = {
	start: startTkkServer,
	stop: stopServer,
	setTkk: setTkk
};