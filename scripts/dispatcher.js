var q = require('q');
var translateAPI = require('./core/translate-api.js');
var getPostPayload = require('./core/get-post-payload.js');
var usageStatisticsDao = require('./dao/usage-statistics-dao');
var requestModule = require('request');

//We need a function which handles requests and send response
function dispatcher(url, requestBody) {

  console.log('Got request for URL: ' + url);

  usageStatisticsDao.incrementUsageCount(url);

  if (url === '/') {
    return serveClient();
  } else if (url === '/robots.txt') {
    return {type: 'PROMISE/TEXT', data: q.resolve('User-agent: *\nDisallow:\n'), contentType: 'text/plain'}
  } else if (url === '/api/translate') {
    return translateAPI.translate(requestBody);
  } else if (url === '/api/tts') {
    return translateAPI.tts(requestBody);
  } else if (url === '/api/languages') {
    return translateAPI.getLanguagesList();
  } else {
    return q.reject(`Unknown URL: ${url}`);
  }
}

function serveClient() {
  var url = process.env.CLIENT_BASE_DOMAIN + '/statics/';

  return {
    type: 'PROXY',
    data: requestModule(url)
  };
}

module.exports = {
  request: dispatcher
}