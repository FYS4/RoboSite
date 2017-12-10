'use strict';

const pidusage = require('pidusage');

module.exports = (io, span) => {
	const defaultResponse = {
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		count: 0,
		mean: 0,
		timestamp: Date.now()
	};

	pidusage.stat(process.pid, (err, stat) => {
		if (err) {
			return;
		}

		const last = span.responses[span.responses.length - 1];

		stat.memory = stat.memory / 1024 / 1024;
		stat.timestamp = Date.now();

		span.os.push(stat);
		if (!span.responses[0] || last.timestamp + (span.interval * 1000) < Date.now()) {
			span.responses.push(defaultResponse);
		}

		// todo: I think this check should be moved somewhere else
		if (span.os.length >= span.retention) span.os.shift();
		if (span.responses[0] && span.responses.length > span.retention) span.responses.shift();

		io.emit('esm_stats', {
			os: span.os[span.os.length - 2],
			responses: span.responses[span.responses.length - 2],
			interval: span.interval,
			retention: span.retention
		});
	});
};
