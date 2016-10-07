var translateAPI = require('./core/translate.js');
var googleResponseProcessor = require('./core/google-response-processor.js');

//We need a function which handles requests and send response
function handleRequest(request, response) {
  if(request.url === '/translate' && request.method === "POST") {
      var requestBody = '';

      request.on('data', function(data) {
        requestBody += data;
        if(requestBody.length > 1e7) {
          response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
          response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
        }
      });

      request.on('end', function() {
        console.log('Got request: ' + requestBody);

        var data = parseDataIfServerCanHandleIt(requestBody);
        if (data === null) {
          return rejectConnection(response);
        }

      	translateAPI.submit(data)
          .then(function (htmlAsString) {
            var jsonData = googleResponseProcessor(htmlAsString);
            console.log(jsonData.extract.translation);

      		  response.writeHead(200, {'Content-Type': 'application/json'});
   	  		  response.end(JSON.stringify(jsonData));
  		    })
          .catch(err => {
            console.log(err);
            rejectConnection(response, err);
          });
      });
  } else if (request.url === '/languages') {
    var langs = translateAPI.getLanguagesList();
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(langs));
  } else {
    rejectConnection(response, `Unknown URL: ${request.url}. please use POST`);
  }
}

function parseDataIfServerCanHandleIt(requestBody) {
  if (translateAPI.isReady()) {
    return JSON.parse(requestBody);
  } else {
    return null;
  }
}

function rejectConnection(response, additionalData) {
  var errorMessage = additionalData || 'Unknown Error';

  response.writeHead(502, {'Content-Type': 'text/html'});
  response.end(`{"error": "${errorMessage}"}`);
}

module.exports = handleRequest;