var requestHandler = require('./scripts/request-handler.js')

var http = require('http');
const PORT=8080; 

var server = http.createServer(requestHandler);

server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
