var request = require('request-promise');
var querystring = require('querystring');
var extend = require('extend');
var fs = require('fs-promise');
var q = require('q');

var tkCalc = require('./../hash/tk-hash');
var tkkScraper = require('./tkk-scraper');
var externalApis = () => require('./topology-manager').readTopology().externalApis;

var tkk = null;
var languagesList = null;

var submitToGoogle = function (data) {
	var translateUrl = externalApis().googleTranslateApi;
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

	return request(fullUrl)
			.catch(res => {
				return q.reject(res.error);
			});
}

function preSubmit(requestData) {

	console.log(requestData);

	if (!requestData.query || !requestData.sourceLang || !requestData.targetLang) {
		return q.reject('Request data is incomplete');
	}

	var query = requestData.query;
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
	return tkkScraper.run()
		.then(res => {
			console.log('Key retrieved ' + res);
			tkk = res;
		});
}

function loadLanguages() {
    return fs.readFile('json/languages.json', 'utf8')
    .then(data => {
      	languagesList = JSON.parse(data);
      	console.log('Loaded ' + languagesList.length + ' languages');
    });
}

function isReady() { return tkk !== null && languagesList !== null; }

function initServer() {
	return q.all([refreshTkk(), loadLanguages()]);
}

setInterval(refreshTkk, 30 * 60 * 1000);

module.exports = {
	//	@PreRequisite: isReady() === true
	start: initServer,
	submit: preSubmit,
	getLanguagesList: () => languagesList,
	isReady: isReady
}
