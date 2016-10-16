function shiftLeftOrRightThenSumOrXor(num, opArray) {
	return opArray.reduce((acc, opString) => {
		var op1 = opString[1];	//	'+' | '-' ~ SUM | XOR
		var op2 = opString[0];	//	'+' | '^' ~ SLL | SRL
		var xd = opString[2];	//	[0-9a-f]

		assert(op1 === '+' || op1 === '-', 'Invalid OP: ' + op1);
		assert(op2 === '+' || op2 === '^', 'Invalid OP: ' + op2);
		assert(('0' <= xd && xd <= '9') || ('a' <= xd && xd <='f'), 'Not an 0x? value: ' + xd);

		var shiftAmount = hexCharAsNumber(xd);
		var mask = (op1 == '+') ? acc >>> shiftAmount : acc << shiftAmount;
		return (op2 == '+') ? (acc + mask & 0xffffffff) : (acc ^ mask);
	}, num);
}

function assert(cond, err) {
	if (!cond) {
		throw Error(err);
	}
}

function hexCharAsNumber(xd) {
	return (xd >= 'a') ? xd.charCodeAt(0) - 87 : Number(xd);
}

function transformQuery(query) {
	for (var e = [], f = 0, g = 0; g < query.length; g++) {
	  var l = query.charCodeAt(g);
	  if (l < 128) {
	  	e[f++] = l;					//	0{l[6-0]}
	  } else if (l < 2048) {
	  	e[f++] = l >> 6 | 0xC0;		//	110{l[10-6]}
	  	e[f++] = l & 0x3F | 0x80;	//	10{l[5-0]}
	  } else if (0xD800 == (l & 0xFC00) && g + 1 < query.length && 0xDC00 == (query.charCodeAt(g + 1) & 0xFC00)) {
	  	//	that's pretty rare... (avoid ovf?)
	  	l = (1 << 16) + ((l & 0x03FF) << 10) + (query.charCodeAt(++g) & 0x03FF);
	  	e[f++] = l >> 18 | 0xF0;		//	111100{l[9-8*]}
	  	e[f++] = l >> 12 & 0x3F | 0x80;	//	10{l[7*-2]}
	  	e[f++] = l & 0x3F | 0x80;		//	10{(l+1)[5-0]}
	  } else {
		e[f++] = l >> 12 | 0xE0;		//	1110{l[15-12]}
		e[f++] = l >> 6 & 0x3F | 0x80;	//	10{l[11-6]}
		e[f++] = l & 0x3F | 0x80;		//	10{l[5-0]}
	  }
	}
	return e;
}

function normalizeHash(encondindRound2) {
	if (encondindRound2 < 0) {
		encondindRound2 = (encondindRound2 & 0x7fffffff) + 0x80000000;
	}
	return encondindRound2 % 1E6;
}

/*
/	EXAMPLE:
/
/	INPUT: query: 'hola', windowTkk: '409837.2120040981'
/	OUTPUT: '70528.480109'
/
*/
function calcHash(query, windowTkk) {
	//	STEP 1: spread the the query char codes on a byte-array, 1-3 bytes per char
	var bytesArray = transformQuery(query);

	//	STEP 2: starting with TKK index, add the array from last step one-by-one, and do 2 rounds of shift+add/xor
	var d = windowTkk.split('.');
	var tkkIndex = Number(d[0]) || 0;
	var tkkKey = Number(d[1]) || 0;

	var encondingRound1 = bytesArray.reduce((acc, current) => {
		acc += current;
		return shiftLeftOrRightThenSumOrXor(acc, ['+-a', '^+6'])
	}, tkkIndex);

	//	STEP 3: apply 3 rounds of shift+add/xor and XOR with they TKK key
	var encondingRound2 = shiftLeftOrRightThenSumOrXor(encondingRound1, ['+-3', '^+b', '+-f']) ^ tkkKey;

	//	STEP 4: Normalize to 2s complement & format
	var normalizedResult = normalizeHash(encondingRound2);

	return normalizedResult.toString() + "." + (normalizedResult ^ tkkIndex)
}

module.exports = calcHash;
