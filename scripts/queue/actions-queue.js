function actionsQueue() {
	var operationsQueue = [];
	var isBusy = false;

	var runLater = (action, args) => {
		addToQueue({
			action: action,
			args: args
		});
	}

	function addToQueue(op) {
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

	return {
		runLater: runLater
	};
}

module.exports = actionsQueue;
