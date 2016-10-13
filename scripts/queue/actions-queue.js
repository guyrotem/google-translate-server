function actionsQueue() {
	var operationsQueue = [];
	var isBusy = false;

	var runLater = (action, args) => {
		var op = makeOp(action, args);

		operationsQueue.push(op);

		if (!isBusy) {
			isBusy = true;
			startWorking();
		}
	}

	function startWorking() {
		if (operationsQueue.length > 0) {
			var nextOp = operationsQueue.shift();
			perform(nextOp).then(startWorking);
		} else {
			isBusy = false;
		}
	}

	function perform(op) {
		return op.action.call(null, op.args);
	}

	function makeOp(action, args) {
		return {
			action: action,
			args: args
		};
	}

	return {
		runLater: runLater
	};
}

module.exports = actionsQueue;
