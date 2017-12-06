'use strict';

/* Core */
const express = require('express'); // Fast, unopinionated, minimalist web framework for Node.js
const path = require('path'); // Provides utilities for working with file and directory paths

/* App */
const routes = require('./routes');

module.exports = (app) => {
	/* view engine setup */
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'hbs');

	/* Cache public folder */
	app.use(express.static(path.resolve(__dirname, 'public'), {
		maxage: 1 * 60 * 1000
	}));

	/* Apply routes to object */
	app = routes(app);

	/* Return updated object */
	return app;
};
