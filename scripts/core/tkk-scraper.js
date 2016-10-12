var phantom = require('phantom');
var q = require('q');

var tkkScraper = function () {
	//return '409846.1881405758';
	var topology = require('./topology-manager').readTopology();
	
	var	pageUrl = topology.externalApis.googleTranslateWebpage;
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
	    	if (status === 'success') {
	    		return sitepage.evaluate(function () {return TKK;});
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
}

module.exports = {
	run: tkkScraper
};
