var request = require('request-promise');
var q = require('q');
var env = require('./../environment');
var assert = require('assert');

describe('TTS tests', () => {
	before((done) => {
		env.copyTopology()
		.then(env.start)
		.then(() => done());
	});

	after((done) => {
		env.stop()
		.then(() => done());
	});

	it('should load client main page', () => {
		return loadMainPage()
			.then(htmlResponse => {
				assert(htmlResponse.indexOf('Translate something...') >= 0, 'Unexpected HTML response');
			});
	});

	it('should get languages JSON', () => {
		return getLanguages()
			.then((response) => {
				var langsJson = JSON.parse(response);
				assert.equal(langsJson.length, 104);
				assert.equal(langsJson[0].code, 'af');
			});
	});

	it('should T2S', () => {
		var ttsQuery = {
			query: 'Hola',
			language: 'es'
		};

		return sendTts(ttsQuery)
			.then((data) => {
				assert.equal(data.length, 3911);
			});
	});

	it('should fetch TKK and get translation', () => {
		var translateQuery = {
			query: 'dog',
			sourceLang: 'auto',
			targetLang: 'fr'
		};

		return translate(translateQuery)
			.then((response) => {
				assert.equal(response.extract.translation, 'chien');
			});
	});
});

var serverBaseDomain = 'http://localhost:9333';	//	TODO: from topology

function loadMainPage() {
	return request.get(serverBaseDomain + '/');
}

function sendTts(ttsQuery) {
	var options = {
	    method: 'POST',
	    uri: serverBaseDomain + '/api/tts',
	    body: ttsQuery,
	    json: true
	};

	return request(options);
}

function translate(translateQuery) {
	var options = {
	    method: 'POST',
	    uri: serverBaseDomain + '/api/translate',
	    body: translateQuery,
	    json: true
	};

	return request(options);
}

function getLanguages() {
	return request.get(serverBaseDomain + '/api/languages');
}

