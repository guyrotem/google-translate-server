var q = require('q');
var translateAPI = require('./core/translate-api.js');
var getPostPayload = require('./core/get-post-payload.js');

//We need a function which handles requests and send response
function dispatcher(url, requestBody) {

  console.log('Got request for URL: ' + url);

  if (!translateAPI.isReady()) {
    return q.reject('server not initialiazed');
  }

  var data = JSON.parse(requestBody);

  if (url === '/api/translate') {
    return translateAPI.submit(data);
  } else if (url === '/api/languages') {
    var langs = translateAPI.getLanguagesList();
    return resolveWithData(langs); //  sync 2 async
  } else {
    return q.reject(`Unknown URL: ${url}`);
  }
}

function resolveWithData(data) {
    var deferred = q.defer();
    deferred.resolve(data);
    return deferred.promise;
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