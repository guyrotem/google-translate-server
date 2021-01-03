const env = require('./environment');

env.copyTopology()
	.then(env.start)
	.catch(err => {console.log(err);});
