
var responseProcessor = (googleStringResponse) => {
	var clean = googleStringResponse
		.replace(/,,/g, ',null,')
		.replace(/,,/g, ',null,')
		.replace(/\[,/g, '[null,')
		.replace(/,\]/g, ',null]');
	var parsed = JSON.parse(clean);
	var translationHeader = parsed[0];
	
	return {
		extract: {
			translation: getTranslation(translationHeader),
			actualQuery: getActualQuery(translationHeader),
			resultType: translationHeader[0].reverse()[0],	//	5th item
			transliteration: getTransliteration(translationHeader.reverse()[0]),
			synonyms: getSynonyms(parsed[1]),
			sourceLanguage: parsed[2]
		},
		originalResponse: "\"" + googleStringResponse + "\""
	};
}

function getTranslation(translationHeader) {
	return translationHeader
		.map(x => x[0])
		.join('');
}

function getActualQuery(translationHeader) {
	return translationHeader
		.map(x => x[1])
		.join(' ');
}

function getTransliteration(transliterationHeader) {
	if (transliterationHeader) {
		return transliterationHeader[2];
	} else {
		return null;
	}
}

function getSynonyms(synonymsData) {
	if (synonymsData) {
		return synonymsData[0][1];
	} else {
		return [];
	}
}

module.exports = responseProcessor;