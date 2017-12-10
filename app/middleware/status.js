'use strict';

const onHeaders = require('on-headers');
const onHeadersListener = require('./helpers/on-headers-listener');
const socketIoInit = require('./helpers/socket-io-init');

module.exports = (processPort) => {
	const Config = {
		span: {
			interval: 1,
			retention: 60
		},
		port: processPort
	};

	const middleware = (req, res, next) => {
		socketIoInit(Config);

		const startTime = process.hrtime();

		onHeaders(res, () => {
			onHeadersListener(res.statusCode, startTime, Config.span);
		});

		next();
	};

	return middleware;
};
