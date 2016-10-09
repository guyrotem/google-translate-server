var q = require('q');
var fs = require('fs');

var env = require('./environment');

env.copyTopology()
	.then(env.start)
	.catch(err => {console.log(err);});
