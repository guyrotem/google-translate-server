const phantom = require('phantom');
const q = require('q');

const tkkScraper = function () {
	//return '409846.1881405758';
	const topology = require('./topology-manager').readTopology();

	const pageUrl = topology.externalApis.googleTranslateWebpage;
	let sitepage;

	return phantom.create(['--ignore-ssl-errors=yes', '--load-images=no', '--ssl-protocol=any'])
		.then(instance => {
			phInstance = instance;
			return instance.createPage();
		})
		.then(page => {
			sitepage = page;
			return page.open(pageUrl);
		})
		.then(status => {
			if (status === 'success') {
				return sitepage.evaluate(function () {
					return TKK;
				});
			} else {
				return q.reject(status);
			}

		})
		.then(tkk => {
			sitepage.close();
			phInstance.exit();
			return tkk;
		})
		.catch(error => {
			phInstance.exit();
			return q.reject(error);
		});
};

module.exports = {
	run: tkkScraper
};
