var phantom = require('phantom');

var tkkScraper = function () {
	//return '409846.1881405758';
	var topology = require('./topology-manager').readTopology();
	
	var	pageUrl = topology.externalApis.googleTranslateWebpage;
	console.log(topology);
	var sitepage;

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
	        return sitepage.evaluate(function () {return TKK;});
	    })
	    .then(tkk => {
	        sitepage.close();
	        phInstance.exit();
	        return tkk;
	    })
	    .catch(error => {
	        console.log(error);
	        phInstance.exit();
	    });
	};

module.exports = {
	run: tkkScraper
};
