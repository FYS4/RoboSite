'use strict';

const socketIo = require('socket.io');
const gatherOsMetrics = require('./gather-os-metrics');

let io;

module.exports = (config) => {
	if (io !== null && io !== undefined) {
		return;
	}
	io = socketIo(config.port);

	io.on('connection', (socket) => {
		socket.emit('esm_start', config.span);
	});

	config.span.os = [];
	config.span.responses = [];
	const interval = setInterval(() => gatherOsMetrics(io, config.span), config.span.interval * 1000);

	// Don't keep Node.js process up
	interval.unref();
};
