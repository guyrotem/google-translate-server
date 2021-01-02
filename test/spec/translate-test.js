const axios = require('axios');
const qs = require('querystring');
const env = require('./../environment');
const assert = require('assert');

describe('TTS tests', () => {
	before((done) => {
		env.copyTopology()
		.then(env.start)
		.then(() => done())
		.catch(err => done(err));
	});

	after(() => {
		return env.stop();
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
				const langsJson = response;
				assert.strictEqual(langsJson.length, 104);
				assert.strictEqual(langsJson[0].code, 'af');
			});
	});

	it('should T2S', () => {
		const ttsQuery = {
			query: 'Hola',
			language: 'es'
		};

		return sendTts(ttsQuery)
			.then((response) => {
				assert.strictEqual(response.data.length, 3868);
			});
	});

	it('should fetch TKK and get translation', () => {
		const translateQuery = {
			query: 'dog',
			sourceLang: 'auto',
			targetLang: 'fr'
		};

		return translate(translateQuery)
			.then((response) => {
				assert.strictEqual(response.extract.translation, 'chien');
			});
	});

	it('should reject translation when query is more than 800 characters long', () => {
		const longTextToTranslate = 'Divný název, vím. Ale na mou obranu, „vsázení se s učiteli“ prostě nezní tak dobře. Slyšíte správně. Rozmohl se nám tu „hazard“. Nutno podotknout, že strůjci všeho jsou sami žáci a učitelé v tom prsty nemají. Žáci sami přicházejí s výzvami a cíli stran svých studijních výsledků, které si v tomto školním roce vytyčili, a dokonce si sami vymýšlí i tresty za nesplnění úkolu. Pouze když tápou, vypomůže dobrou radou učitel. Od toho jsme přeci tady…  Kontrolovaná předsevzetí letí momentálně hlavně mezi bezpečáky, a podařilo se mi zjistit, že vlastně už od adapťáku. Oba adapťáky musely být výživné a nezapomenutelné, aspoň podle všech těch fotek na facebooku. Nicméně, ajťáci se jeví zatím oněmi předsevzetími nedotčeni. Možná jsou ještě pořád zaměstnáni všemi těmi křížky a kolečky ze školního kola Pišqworek, kde nad bezpečáky svou účastí mírně převažovali. Tajemstvím není, že ze školního kola vzešli dva týmy Pišqworkářů, které nás budou reprezentovat v okresním kole příští měsíc. A-TEAM už je stálicí, letos v něm zazáří Dominik Vícha, Jaroslav Hron, Eliška Daová, František Soukup (všichni z 4.FI) a Petr Procházka (z 2.LI), jako náhradník bezpečáckou čest hájí Aleš Vacl (z 4.GB). Další tým se chlubí poetickým názvem Řezníci a tvoří ho o poznání více bezpečáků, jmenovitě Jakub Kuchyňka, Karel Vachoušek, Robert Daniel (všichni z 4.GB), Mikuláš Pecl (z 3.IB) a Lukáš Bukovský (z 1.NI), zde je náhradníkem Martin Gráf (taktéž z 1.NI). Doufám, že týmy dostojí své pověsti či jménu, protože heslo zní: „Pan učitel chce další pohár!“  Ty sázky vlastně nejsou až takovou žhavou novinkou. Mám dojem, že dokonce existuje smlouva, která zavazuje pana učitele Cikána k pronájmu billboardu pro svou třídu 2.KB, splní-li KáBéčka svou část smlouvy. Tedy pokud je do té doby ministerstvo dopravy nezakáže. Dobrá reklama na maturák. Hojná účast zajištěna. KáBéčka měla pod čepicí!  Sázky z posledních dní sice mají poněkud jiné schéma, v němž se vlastně vsází žáci sami se sebou s posvěcením vyučujícího a s celou třídou coby svědky události. Snad se nic nestane, upustím-li nějakou tu podrobnost. Tak třeba… Vážně bych nechtěla desetkrát vyběhnout a seběhnout schody ve školní budově, jako jedna nejmenovaná žákyně překvapivě opět z Kábéček, částečně i proto, že už teď v říjnu mám noční můry z Kleti, která se kvapem blíží, a ty schody mi jí tak nějak připomínají. Pozadu nejsou ani eMBéčka. Tam bude možná jedna slečna muset klikovat. Ufff, padesátkrát. Dámy, všechna čest a hodně zdaru, aby na schody a kliky vůbec nedošlo. Držím pěsti. Utěšovat se můžete tím, že pokud by se náhodou něco šeredně pokazilo, budete mít aspoň natrénováno, což taky není k zahození.  Pánové z eMBéček jsou poněkud opatrnější a střídmější. I když nabídka samostatné týdenní služby, takže mazání tabule, nošení třídnice, úklidu, a tak dále, také není malou obětí, jedná se přece jen o chlapy, kteří chtějí dobrovolně uklízet! I vám hodně zdaru, panové.  Tak co ajťáci? Necháte to tak? Nebo si také vytyčíte splnitelný cíl, který závisí jen a pouze na vašem snažení, pak půjdete tvrdě za ním, protože pokud ne, přijde na řadu vaše vlastní oběť? Kdo se na to cítí dost odhodlaně?';
		const translateQuery = {
			query: longTextToTranslate,
			sourceLang: 'auto',
			targetLang: 'fr'
		};

		return translate(translateQuery)
			.catch(response => {
				assert.strictEqual(response.data.error, 'Maximum supported query length is currently 800. Longer queries will be supported soon (query must be sent to Google as form data)');
			});
	})
});

const serverBaseDomain = 'http://localhost:9333';	//	TODO: from topology

function loadMainPage() {
	return axios.get(serverBaseDomain + '/').then((response) => response.data);
}

function sendTts(ttsQuery) {
	return axios.get(serverBaseDomain + '/api/tts?' + qs.stringify(ttsQuery))
}

function translate(translateQuery) {
	const options = {
	    method: 'POST',
	    url: serverBaseDomain + '/api/translate',
	    data: translateQuery
	    // json: true
	};

	return axios(options).then((response) => response.data, (response) => response.response);
}

function getLanguages() {
	return axios.get(serverBaseDomain + '/api/languages').then((response) => response.data);
}

