'use strict';

/* Core */
const Express = require('express');
const System = require('os');
const Path = require('path');

/* Routes */
const Routes = require('./routes');

/* Models */
const Session = require('../customer/models/session');

module.exports = (app) => {
	/* Remove old sessions due to restart */
	app.use((req, res, next) => {
		process.nextTick(() => {
			Session.deleteMany({});
			next();
		});
	});
	
	// view engine setup
	app.use(Express.static(Path.resolve(__dirname, 'public'), {
		maxage: 1 * 60 * 1000
	}));
	app.set('views', Path.join(__dirname, 'views'));
	app.set('view engine', 'hbs');

	return Routes(app);
};
