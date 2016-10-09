var q = require('q');
var translateAPI = require('./core/translate-api.js');
var googleResponseProcessor = require('./core/google-response-processor.js');
var getPostPayload = require('./core/get-post-payload.js');

//We need a function which handles requests and send response
function dispatcher(url, requestBody) {

  console.log('Got request for URL: ' + url);

  if (!translateAPI.isReady()) {
    return q.reject('server not initialiazed');
  }

  var data = JSON.parse(requestBody);

  if(url === '/translate') {
    return translateAPI.submit(data)
      .then(function (responseAsString) {
        var jsonData = googleResponseProcessor(responseAsString);
        console.log(jsonData.extract.translation);
        return jsonData;
      });
  } else if (url === '/languages') {
    var langs = translateAPI.getLanguagesList();
    var deferred = q.defer();
    deferred.resolve(langs);
    return deferred.promise;
  } else {
    return q.reject(`Unknown URL: ${url}`);
  }
}

function start() {
  require('./core/topology-manager').init();
  return translateAPI.start();
}

module.exports = {
  start: start,
  request: dispatcher,
  isReady: translateAPI.isReady
}