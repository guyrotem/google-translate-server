// var tkk = '123456.83426423';
var http = require('http');
var q = require('q');
var tkk = null;

function requestHandler(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(makePageContent());
}

function startTkkServer(port) {
	var deferred = q.defer();
	var server = http.createServer(requestHandler);

	server.listen(port, function () {
		//	server loaded
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
	setTkk: setTkk
};