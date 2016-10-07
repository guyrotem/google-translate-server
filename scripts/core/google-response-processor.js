
var responseProcessor = (googleStringResponse) => {
	//var clean = googleStringResponse.replace(/,+/g, ',').replace(/\[,/g, '[').replace(/,\]/g, ']');
	var clean = googleStringResponse
	.replace(/,,/g, ',null,')
	.replace(/,,/g, ',null,')
	.replace(/\[,/g, '[null,')
	.replace(/,\]/g, ',null]');
	var parsed = JSON.parse(clean);
	var gtHeader = parsed[0];
	
	return {
		extract: {
			translation: gtHeader[0][0],
			actualQuery: gtHeader[0][1],
			resultType: gtHeader[0].reverse()[0],	//	5th item
			transliteration: getTransliteration(gtHeader[1]),
			synonyms: getSynonyms(parsed[1])
		},
		originalResponse: "\"" + googleStringResponse + "\""
	};
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