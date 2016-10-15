var fs = require('fs');
var server = require('./scripts/run-server');

if (!fs.existsSync('.conf')) {
    fs.mkdirSync('.conf');
}

require('./scripts/load-dot-env')();

var cp = fs.createReadStream('./scripts/conf/topology.production.json')
			.pipe(fs.createWriteStream('./.conf/topology.json'));

cp.on('close', () => {
	server.startServer();
});

cp.on('err', err => {
	console.log(err);
	process.exit();
});

