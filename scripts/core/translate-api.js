var request = require('request');
var requestPromise = require('request-promise');
var querystring = require('querystring');
var extend = require('extend');
var fs = require('fs-promise');
var q = require('q');

var tkCalc = require('./../hash/tk-hash');
var tkkScraper = require('./tkk-scraper');
var externalApis = () => require('./topology-manager').readTopology().externalApis;
var googleResponseProcessor = require('./google-response-processor');
var usageStatisticsDao = require('./../dao/usage-statistics-dao');
//	TODO: Alternative API exists:
//https://translate.googleapis.com/translate_a/single?client=gtx&sl=${}&dt=t&tl=${}&q=${}

var NOT_INITIALIZED_MESSAGE = 'Server is still waking up, waiting to get a key from Gooogle. Please try again in a few seconds. it happens often on the 1st attempt after an idle period';

var lastGoogleRateLimitError = null;
var tkk = null;
var languagesList = [{
	  "name": "English",
	  "code": "en"
	}, {
	  "name": "Spanish",
	  "code": "es"
	}, {
	  "name": "French",
	  "code": "fr"
	}];

function submitTranslation(data) {
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

	var options = {
	  url: fullUrl,
	  headers: {
	    'Referer': translateUrl
	  }
	};

	//if (data.q.length > 800) {
		//options.formData = {q: data.q};
		//delete q.data;

//	TODO: for long texts we have the following
		// pc:1
		// otf:1
		// tsel:0
		// kc:15
	//}
	var captchaPageError = 'This page appears when Google automatically detects requests coming from your computer network which appear to be in violation of the';

	return requestPromise(options)
		.catch(res => {
			if (res.error.indexOf(captchaPageError) > -1) {
				lastGoogleRateLimitError = new Date();
			}
			return q.reject(res.error);
		});
}

function submitTts(data) {
	var ttsUrl = externalApis().googleTtsApi;
	var queryParams = extend({
		ie: 'UTF-8',
		total: 1,
		idx: 0,
		client: 't'
	}, data);

	var fullUrl = ttsUrl + '?' + querystring.stringify(queryParams);

	console.info(fullUrl);

	var options = {
	  url: fullUrl,
	  headers: {
	    'Referer': fullUrl
	  }
	};

	return request(options);
}

function translate(requestData) {
	if (!isReady()) {
		return rejectWithError(NOT_INITIALIZED_MESSAGE);
	}

	if (requestData.query && requestData.query.length > 800) {
		return rejectWithError('Maximum supported query length is currently 800. Longer queries will be supported soon (query must be sent to Google as form data)');
	}

	if (killFeature()) {
		return rejectWithError('Google detected too many requests submitted from this IP. service is temporarily not available');
	}

	console.log(requestData);

	if (!requestData.query || !requestData.sourceLang || (!requestData.targetLang && !requestData.targetLangs)) {
		return {
			type: 'PROMISE/TEXT',
			data: q.reject('Request data is incomplete')
		};
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

	var promises = queries.map(submitTranslation);
	
	var responsePromise = q.all(promises)
		.then(function (stringResponses) {
        	var jsonsData = stringResponses.map(googleResponseProcessor);
        	console.log(jsonsData.map(x => x.extract.translation));
        	return isMultipleQuery ? jsonsData : jsonsData[0];
      });

	return {
		type: 'PROMISE/TEXT',
		contentType: 'application/json',
		data: responsePromise
	}
}

function killFeature() {
	return lastGoogleRateLimitError !== null && lessThanFourHoursAgo(lastGoogleRateLimitError);
}

function lessThanFourHoursAgo(time) {
	var FOUR_HOURS = 4 * 60 * 60 * 1000;
	return ((new Date()) - time) < FOUR_HOURS;
}

function tts(requestData) {
	  if (!isReady()) {
	    return rejectWithError(NOT_INITIALIZED_MESSAGE);
	  }

	var submitData = {
		q: requestData.query,	//	encodeURIComponent?
		tl: requestData.targetLang || requestData.language,
		textlen: requestData.query.length,
		tk: tkCalc(requestData.query, tkk),
		ttsspeed: requestData.speed
	};

	return {
		type: 'PROXY',
		data: submitTts(submitData)
	};
}

function refreshTkk() {
	return tkkScraper.run()
		.then(newTkk => {
			console.log('Key retrieved ' + newTkk);

			var oldTkk = tkk;
			tkk = newTkk;

			if (oldTkk !== newTkk) {
				return usageStatisticsDao.addTkk(newTkk);
			}
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
	usageStatisticsDao.getLastTkk()
		.then((lastTkk) => {
			if (tkk === null) {
				console.log(`Pre-loaeded last TKK: ${lastTkk}`);
				tkk = lastTkk;
			}
		});

	return q.all([fetchTkkWithExponentialBackoff(), loadLanguages()])
		.then(() => {setInterval(refreshTkk, 45 * 60 * 1000);});
}

function fetchTkkWithExponentialBackoff() {
	return expBackOff(refreshTkk, 4096);
}

function expBackOff(cb, initialBackoff) {
	return cb()
		.catch(() => {
			console.error('failed to fetch key, trying again in ' + initialBackoff);
			setTimeout(() => {
				return expBackOff(cb, 2 * initialBackoff);
			}, initialBackoff);
		});
}

function getLanguagesList() {
	return {
		type: 'PROMISE/TEXT',
		data: resolveWithData(languagesList)
	};
}

function resolveWithData(data) {
    var deferred = q.defer();
    deferred.resolve(data);
    return deferred.promise;
}

function rejectWithError(error) {
  return {
    type: 'PROMISE/TEXT',
    data: q.reject(error)
  };
}

module.exports = {
	init: initServer,
	translate: translate,
	tts: tts,
	getLanguagesList: getLanguagesList,
	isReady: isReady
};
