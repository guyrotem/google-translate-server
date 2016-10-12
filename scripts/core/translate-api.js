var request = require('request-promise');
var querystring = require('querystring');
var extend = require('extend');
var fs = require('fs-promise');
var q = require('q');

var tkCalc = require('./../hash/tk-hash');
var tkkScraper = require('./tkk-scraper');
var externalApis = () => require('./topology-manager').readTopology().externalApis;
var googleResponseProcessor = require('./google-response-processor');

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

function prepareAndSubmit(requestData) {

	console.log(requestData);

	if (!requestData.query || !requestData.sourceLang || (!requestData.targetLang && !requestData.targetLangs)) {
		return q.reject('Request data is incomplete');
	}

	var isMultipleQuery = !!requestData.targetLangs;

	var query = requestData.query;
	var sourceLang = requestData.sourceLang;
	var targetLangs = requestData.targetLangs || [requestData.targetLang];
	var tk = tkCalc(query, tkk);

	var queries = targetLangs.map(tl => {
		return {
			q: query,
			sl: sourceLang,
			tl: tl,
			tk: tk
		};
	});

	var promises = queries.map(submitToGoogle);
	
	return q.all(promises)
		.then(function (stringResponses) {
        	var jsonsData = stringResponses.map(googleResponseProcessor);
        	console.log(jsonsData.map(x => x.extract.translation));
        	return isMultipleQuery ? jsonsData : jsonsData[0];
      });
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
	return q.all([fetchTkkWithExponentialBackoff(), loadLanguages()])
		.then(() => {setInterval(refreshTkk, 45 * 60 * 1000);});
}

function fetchTkkWithExponentialBackoff() {
	return expBackOff(refreshTkk, 4196);
}

function expBackOff(cb, initialBackoff) {
	return cb()
		.catch(() => {
			console.log('failed to fetch key, trying again in ' + initialBackoff);
			setTimeout(() => {
				return expBackOff(cb, 2 * initialBackoff);
			}, initialBackoff);
		});
}

module.exports = {
	//	@PreRequisite: isReady() === true
	start: initServer,
	submit: prepareAndSubmit,
	getLanguagesList: () => languagesList,
	isReady: isReady
}
