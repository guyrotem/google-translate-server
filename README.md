# google-translate-server

NodeJS proxy for Google Translate

### [See demo here](https://google-translate-proxy.herokuapp.com/)

[![Build Status](https://travis-ci.org/guyrotem/google-translate-server.svg?branch=master)](https://travis-ci.org/guyrotem/google-translate-server)

## Setup

Make sure you have npm properly installed.

1.	git clone git@github.com:guyrotem/google-translate-server.git
2.	_npm install_
3.	configure .env file (can be done by running "cp dotEnv .env" in the root of the project)
4.	_npm start_

**Currently you must have Postgres installed and have a schema called "google_translate_server" configured locally (or use a different name, but make sure to rename it in .env as well). Until I make a workaround, you should either instatll it properly, or workaround it by removing all references to Postgres**

You may also work in test mode, where translation system is mocked by the data contained in [data.json](https://github.com/guyrotem/google-translate-server/blob/master/test/data.json) file.
`npm run simulation`
In this mode, no requests will be sent to Google, but it uses the same "production" code to extract the TKK and send queries (useful for IT tests).
It currently only supports the queries "dog" and "cat", in French, Spanish, German and Hebrew, but you may modify the data file for more :).

## Sample client using this API

See [google-translate-client](https://github.com/guyrotem/google-translate-client/) project for a working example of a FE project using this API (translating into multiple languages simultanously!)

## ¡¿ Why do I need a proxy ?!

Can't I just call the API used by Google Translate?
Well, sure, just open the networking panel of the Dev tools and see where the request goes.
You would notice that the API requires around a dozen parameters, most of which you will quickly understand or walk around them easily.
...except for "tk", which has some random-looking values: e.g.: "258417.372466". Try to fake it with random values, and you will get HTTP status 403 (Forbidden).
It turns out that "_tk_" is a hash value based on your query (the string you wish to translate) and some private key (called TKK), which is embedded in your DOM when you load the Google translate page. This private key changes every hour (but it seems that old keys can be used for quite a long time before they actually expire).
For more info on the hash function, see [tk-hash.js](https://github.com/guyrotem/google-translate-server/blob/master/scripts/hash/tk-hash.js).

As a conclusion, in order to use Google's API directly, you would have to:

1) get your hands on some private key (by loading Google Translate website) => tkk
2) calc: tk := googleHashFunction(query, tkk)
3) call the AJAX API with (query, tk, targetLang, sourceLang, ...) and some more irrelevant fields
4) parse the result to get the data you wished for (which is not as straight forward as you'd might expect)

The API result is made of arrays of arrays (like a JSON that was stripped out of its labels), so you need to figure out on your own what every field means. Moreover, there are at least 4 different result formats (depending on the target language, complexity of the query, etc.) so you must learn to adapt.

**This proxy API does all that for you!**

## APIs

_/api/translate_

translate a query into multiple languages simultaneously.

INPUT: 
```
{
	query: String,
	sourceLang: String,	//	2 or 3 letters, _usually_ the ISO2 language code, small case

	// Use exactly one of the following two
	targetLangs?: String[],	//	USE targetLangs (array) XOR targetLang (string)	
	targetLang?: String,	//
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

_/api/languages_

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
_/api/tts_

INPUT

```
_(as query string)_
{
	query: String,
	language: String,	//	2 or 3 letters, _usually_ the ISO2 language code, small case
	speed?: Decimal		//	optional, in range [0.2, 1]
}

e.g.:
_/api/tts?query=perro&language=es&speed=0.24_
```

OUTPUT
mpeg audio 

## IMPORTANT NOTICE

Google provides an Enterprise API for translating large amounts of text.
It is actually [not so expensive](https://cloud.google.com/translate/v2/pricing).
If you need to use it for anything beyond personal usage, please create an enterprise account. (This is presumably why a friendlier API is not supplied by Google).
