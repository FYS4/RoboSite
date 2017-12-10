'use strict';

/* Core */
const express = require('express'); // Fast, unopinionated, minimalist web framework for Node.js
const cluster = require('cluster'); // Take advantage of multi-core systems
const path = require('path'); // Provides utilities for working with file and directory paths
const os = require('os'); // Provides operating system-related utility methods

/* Best Practices */
const helmet = require('helmet'); // Helps secure your apps by setting various HTTP headers
const compression = require('compression'); // Compress HTTP responses
const morgan = require('morgan'); // HTTP request logger
const bodyparser = require('body-parser'); // Parse HTTP request body

/* Cluster */
const customer = require('./customer'); // Customer site
const employee = require('./employee'); // Employee site

/* Create Webserver */
let app = express();

/* Load modules */
app.use(helmet());
app.use(compression());
app.use(morgan('dev')); // Format: :method :url :status :response-time ms - :res[content-length]
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
	extended: true
}));
app.use(express.static(path.resolve(__dirname, 'public'), {
	maxage: 1 * 60 * 1000
}));

/* Employees */
if (cluster.isMaster) {
	/* Create workers */
	const numWorkers = (os.cpus().length <= 4 ? os.cpus().length : 4);
	for (let i = 0; i < numWorkers; i += 1) {
		cluster.fork(); // Create a worker
	}

	/* If a worker 'dies' */
	cluster.on('exit', () => {
		cluster.fork(); // Create a worker
	});

	app.cluster = cluster;
	app = employee(app); // Apply employee site
}

/* Customers */
if (cluster.isWorker) {
	app = customer(app); // Apply customer site
}

/* Return Webserver-object */
module.exports = app;
