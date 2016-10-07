var http = require('http');
var loadConfig = require('./utils/load-config.js');
var requestHandler = require('./scripts/request-handler.js');

var server = http.createServer(requestHandler);
var config = loadConfig();

server.listen(config.port, function() {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", config.port);
});
