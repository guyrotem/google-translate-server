var request = require('request-promise');
var querystring = require('querystring');
var extend = require('extend');

var tkCalc = require('./tk-hash.js');
var tkkScraper = require('./tkk-scraper.js');

var tkk = null;
var languagesList = null;

var submitToGoogle = function (data) {
	var translateUrl = 'https://translate.google.com/translate_a/single'
	var queryParams = extend({
		client: 't',
		hl: 'en',
		dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
		ie: 'UTF-8',
		oe: 'UTF-8',
		source: 'bh',
		ssel: '0',
		tsel: '0',
		kc: '1'
	}, data);

	var fullUrl = translateUrl + '?' + querystring.stringify(queryParams);

	return request(fullUrl);
}

var handleClientRequest = function (requestData) {

	console.log(requestData);

	if (!isReady()) {
		throw new Error("Server not initialized!");
	}

	var query = requestData.query || '';
	var sourceLang = requestData.sourceLang;
	var targetLang = requestData.targetLang;
	var tk = tkCalc(query, tkk);

	var data = {
		q: query,
		sl: sourceLang,
		tl: targetLang,
		tk: tk
	};
	
	return submitToGoogle(data);
}

function refreshTkk() {
	tkkScraper.run()
		.then(res => {
			console.log('Key retrieved ' + res);
			tkk = res;
		});
}

function loadLanguages() {
	var fs = require('fs');
    var obj;
    fs.readFile('scripts/core/languages.json', 'utf8', function (err, data) {
      if (err) {
      	throw err;
      } else {
      	languagesList = JSON.parse(data);
      	console.log('Loaded ' + languagesList.length + ' languages');
      }
    });
}

function isReady() { return tkk !== null && languagesList !== null; }

function initServer() {
	refreshTkk();
	loadLanguages();
}

initServer();

setInterval(refreshTkk, 30 * 60 * 1000);

module.exports = {
	submit: handleClientRequest,
	getLanguagesList: () => languagesList,
	isReady: isReady
}
