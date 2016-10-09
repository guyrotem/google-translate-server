var googleTkCalculator = (function () {
	var gj = function(num, opString) {
	    for (var c = 0; c < opString.length - 2; c += 3) {
	      var d = opString.charAt(c + 2),
	      d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d),
	      d = "+" == opString.charAt(c + 1) ? num >>> d : num << d;
	      num = "+" == opString.charAt(c) ? num + d & 4294967295 : num ^ d
	    }
	    return num;
	  }

	return function(query, windowTkk) {
	    var d = windowTkk.split(".");
	    var tkkIndex = Number(d[0]) || 0;
	    var tkkKey = Number(d[1]) || 0;

	    for (var e = [], f = 0, g = 0; g < query.length; g++) {
	      var l = query.charCodeAt(g);
	      128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < query.length && 56320 == (query.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (query.charCodeAt(++g) & 1023),
	        e[f++] = l >> 18 | 240,
	        e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
	        e[f++] = l >> 6 & 63 | 128),
	        e[f++] = l & 63 | 128)
	    }
	    var a = tkkIndex;
	    for (f = 0; f < e.length; f++) {
	    	a += e[f];
	        a = gj(a, "+-a^+6");
	    }
	    a = gj(a, "+-3^+b+-f");
	    a ^= tkkKey;
	    0 > a && (a = (a & 2147483647) + 2147483648);
	    a %= 1E6;
	    return '' + (a.toString() + "." + (a ^ tkkIndex))
	}
})();

module.exports = googleTkCalculator;

//	TODO: add test:	('hola', '409837.2120040981') => '70528.480109'