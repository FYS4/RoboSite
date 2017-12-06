'use strict';

/* Core */
const express = require('express'); // Fast, unopinionated, minimalist web framework for Node.js
const path = require('path'); // Provides utilities for working with file and directory paths

/* Session */
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const passport = require('./config/passport');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const configDB = require('./config/database');

/* App */
const routes = require('./routes');

module.exports = (app) => {
	mongoose.connect(configDB.MongoDB.URL, {
		useMongoClient: true
	});

	/* Configuring Session Object */
	const userSession = {
		store: new redisStore(configDB.Redis),
		secret: 'RoboBooth',
		secure: false,
		HttpOnly: true,
		rolling: true,
		resave: true,
		saveUninitialized: true,
		cookie: {
			maxAge: (5 * 60 * 1000)
		}
	};

	if (app.get('env') === 'production') {
		app.set('trust proxy', 1);
		userSession.cookie.secure = true;
	}

	/* Setting up Passport */
	app.use(session(userSession));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

	/* view engine setup */
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'hbs');

	/* Cache public folder */
	app.use(express.static(path.resolve(__dirname, 'public'), {
		maxage: 1 * 60 * 1000
	}));

	/* Apply routes to object */
	app = routes(app, passport);

	/* Return updated object */
	return app;
};
