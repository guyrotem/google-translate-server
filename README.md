# google-translate-server

NodeJS proxy for Google Translate & TTS services.

supplying a simple API to get you through Google's blocking of the public API for free.
_see APIs below_

### [See live demo here](https://google-translate-proxy.herokuapp.com/)
[![Build Status](https://travis-ci.org/guyrotem/google-translate-server.svg?branch=master)](https://travis-ci.org/guyrotem/google-translate-server)

IMPORTANT: _as it is deployed to a free Heroku server, it has limited dynos quota per month. if you need to make extensive use, 
please don't overload this server and deploy your own one... I started reaching my monthly quota in the last few months, so by the end of the month no one could use it.._

## Setup

Make sure you have npm properly installed.

1.	git clone git@github.com:guyrotem/google-translate-server.git
2.	_npm install_
3.	type _cp dotEnv .env_ in the root of the project, to create your private environment vars
4.	install and configure Postgres on your computer (or skip it and disable Postgres. see below)
	=> Install Postgres => create a local database: **"psql -c 'create database google_translate_server;' -U postgres"** => make sure PostgreSQL is running in the background (the elephant!)
5.	_npm start_

You may also disable Postgres: "sed -i -e 's/ENABLE_PSQL=true/ENABLE_PSQL=false/' .env"

You may also work in test mode, where translation system is mocked by the data contained in [data.json](https://github.com/guyrotem/google-translate-server/blob/master/test/data.json) file.
`npm run simulation`
In this mode, no requests will be sent to Google, but it uses the same "production" code to extract the TKK and send queries (useful for IT tests).
It currently only supports the queries "dog" and "cat", in French, Spanish, German and Hebrew, but you may modify the data file for more :).

## ¡¿ Why do I need a proxy ?!

Can't I just call the API used by Google Translate?
Well, sure, just open the networking panel of the Dev tools and see where the requests go.
You would notice that the API requires around a dozen parameters, most of which you will quickly understand or walk around them easily.
...except for "tk", which has some random-looking values: e.g.: "258417.372466". Try to fake it with random values, and you will get HTTP status 403 (Forbidden).
It turns out that "_tk_" is a hash value based on your query (the string you wish to translate) and some private key (called TKK), which is embedded in your DOM when you load the Google translate page. This private key changes every hour (but it seems that old keys can be used for quite a long time before they actually expire).
For more info on the hash function, see [tk-hash.js](https://github.com/guyrotem/google-translate-server/blob/master/scripts/hash/tk-hash.js).

As a conclusion, in order to use Google's API directly, you would have to:

1) get your hands on some private key (by loading Google Translate website) => tkk
2) calc: tk := googleHashFunction(query, tkk)
3) call the AJAX API with (query, tk, targetLang, sourceLang, ...) and some more irrelevant fields
4) parse the result to get the data you wished for (which is not as straight forward as you'd might expect)

The API result is made of arrays of arrays (like a JSON that was stripped out of its labels), so you are left to figure out what every field means. Moreover, there are at least 4 different result formats (depending on the target language, complexity of the query, etc.) so you must learn to adapt.

**This proxy API does all that for you!**

## APIs

> /api/translate > /api/languages > /api/tts

### _/api/translate_

translate a query into multiple languages simultaneously.

INPUT:

for multiple languages, use POST with the following JSON body:
```
{
	query: String,
	sourceLang: String,	//	2 or 3 letters, _usually_ the ISO2 language code, small case
	targetLangs: String[],	//	USE targetLangs (array) to translate to multiple target languages in the same call
}
```
**NOTE: maximal supported query length is currently around 850 characters. it will be fixed soon. Longer queries should be sent to Google as form-data**

for a single target language, you may use GET with the following query string:
```
{
	query: String,
	sourceLang: String,	//	2 or 3 letters, _usually_ the ISO2 language code, small case
	targetLang: String,	//      USE targetLang (string) to translate to a single target langauge
}
```

you may use sourceLang: "auto" to let Google choose for you

OUTPUT
```
[
 {
	extract: {
		translation: String,
		actualQuery: String, //	best match for query (should be the same as the query, unless there was a typo)
		resultType: Int, //	index of Google's response format
		transliteration: String, //	transliteration of the word in latin alphabet (partially available)
		synonyms: Array[String]	 //	full-query alternative suggestions (only available for short queries)
	},
	originalResponse: String  //	the original response returned from Google's API as a string
 },
 { ... }
]
```

> EXAMPLE: https://google-translate-proxy.herokuapp.com/api/translate?query=where%20are%20my%20sunglasses&targetLang=de&sourceLang=en

### _/api/languages_

INPUT: [no input arguments]

OUTPUT
an array of all available languages, with names and their appropriate codes:
```
[
	{
		"name": "Spanish",
		"code": "es"
	},
...
]
```
> EXAMPLE: https://google-translate-proxy.herokuapp.com/api/languages

### _/api/tts_

INPUT: GET (as query string)

```
{
	query: String,
	language: String,	//	2 or 3 letters, _usually_ the ISO2 language code, small case
	speed?: Decimal		//	optional, in range [0.2, 1]
}
```

OUTPUT
mpeg audio 

EXAMPLE:
https://google-translate-proxy.herokuapp.com/api/tts?query=perro&language=es&speed=0.24

## Sample client using this API

See [google-translate-client](https://github.com/guyrotem/google-translate-client/) project for a working example of a FE project using this API (translating into multiple languages simultanously!)

## IMPORTANT NOTICE

Google provides an Enterprise API for translating large amounts of text.
It is actually [not so expensive](https://cloud.google.com/translate/v2/pricing).
If you need to use it for anything beyond personal usage, please create an enterprise account. (This is presumably why a friendlier API is not supplied by Google).
