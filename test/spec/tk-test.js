// var request = require('request-promise');
// var q = require('q');
var tkHash = require('./../../scripts/hash/tk-hash');
var assert = require('assert');

describe('TK unit tests', () => {

	it('should calc TK value based on query+TKK', () => {
		var hash = tkHash('éléphant', '123456.777888');
		assert.equal(hash, '478558.438046');
	});

	it('should work with special chars and different TKKs', () => {
		var hash = tkHash('熊猫', '123457.220022');
		assert.equal(hash, '916835.794402');
	});
});


