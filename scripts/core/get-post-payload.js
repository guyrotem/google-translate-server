var q = require('q');

var getPostPayload = function getPostPayload(request) {
  var deferred = q.defer();

  var requestBody = '';

  request.on('data', function (data) {
    requestBody += data;

    if (requestBody.length > 1e7) {
      deferred.reject('Request Entity Too Large');
    }
  });

  request.on('end', function() {
    console.log('Got request: ' + requestBody);

    deferred.resolve(requestBody);
  });

  return deferred.promise;
}

module.exports = getPostPayload;