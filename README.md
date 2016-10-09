# google-translate-server

NodeJS proxy for Google Translate

## ¡¿ Why do I need a proxy ?!

Can't I just call the API used by Google Translate?
Well, sure, just open the networking panel of the Dev tools and see where the request goes.
You would notice that the API requires around a dozen parameters, most of which you will quickly understand or walk around them easily.
...except for "tk", which has some random-looking values: e.g.: "258417.372466". Try to fake it with random values, and you will get HTTP status 403 (Forbidden).
It turns out that "_tk_" is a hash value based on your query (the string you wish to translate) and some private key (called TKK), which is embedded in your DOM when you load the Google translate page. This private key changes every hour (but it seems that old keys can be used for quite a long time before they actually expire).
For more info on the hash function, see [tk-hash.js](https://github.com/guyrotem/google-translate-server/blob/master/scripts/core/tk-hash.js).

As a conclusion, in order to use Google's API directly, you would have to:

1) get your hands on some private key (by loading Google Translate website) => tkk
2) calc: tk := googleHashFunction(query, tkk)
3) call the AJAX API with (query, tk, targetLang, sourceLang, ...) and some more irrelevant fields
4) parse the result to get the data you wished for (which is not as straight forward as you'd might expect)

The API result is made of arrays of arrays (like a JSON that was stripped out of its labels), so you need to figure out on your own what every field means. Moreover, there are at least 4 different result formats (depending on the target language, complexity of the query, etc.) so you must learn to adapt.

**This proxy API does all that for you!**

_/translate_

INPUT: 
```
{
	query: String,
	sourceLang: String,	//	2 or 3 letters, _usually_ the ISO2 language code, small case
	targetLang: String  //	...
}
```

OUTPUT
```
{
	extract: {
		translation: String,
		actualQuery: String, //	best match for query (should be the same as the query, unless there was a typo)
		resultType: Int, //	index of Google's response format
		transliteration: String, //	transliteration of the word in latin alphabet (partially available)
		synonyms: Array[String]	 //	full-query alternative suggestions (only available for short queries)
	},
	originalResponse: String  //	the original response returned from Google's API as a string
}
```

_/languages_

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

## Setup

Make sure you have npm properly installed.

1.	clone this repo
2.	_npm install_
3.	_npm start_

You may also work in test mode, where translation system is mocked by the data contained in [data.json](https://github.com/guyrotem/google-translate-server/blob/master/test/data.json) file.
`npm run-script start-mocks`
In this mode, no requests will be sent to Google, but it uses the same "production" code to extract the TKK and send queries (useful for IT tests).
It currently only supports the queries "dog" and "cat", in French, Spanish, German and Hebrew, but you may modify the data file for more :).

## Sample client using this API

See [google-translate-client](https://github.com/guyrotem/google-translate-client/) project for a working example of a FE project using this API (translating into multiple languages simultanously!)

## IMPORTANT NOTICE

Google provides an Enterprise API for translating large amounts of text.
It is actually [not so expensive](https://cloud.google.com/translate/v2/pricing).
If you need to use it for anything beyond personal usage, please create an enterprise account. (This is presumably why a friendlier API is not supplied by Google).
