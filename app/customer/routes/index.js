'use strict';

/* Models */
const Session = require('../models/session');

/* Routes */
const account = require('./account');
const home = require('./home');
const auth = require('./auth');
const img = require('./image');

module.exports = (app, passport) => {
	/* Session */
	app.use((req, res, next) => {
		process.nextTick(() => {
			/* Remove Old Sessions */
			Session.deleteMany({
				last_seen: {
					$lt: new Date(Date.now())
				}
			});

			/* Update or Create Session */
			Session.findOne({
				sessionID: req.sessionID
			}, (err, session) => {
				if (err) {
					return next();
				}

				if (!session) {
					/* Create New Session */
					session = new Session();
					session.sessionID = req.sessionID;
				}

				/* Update Session */
				session.process = process.pid;
				session.last_seen = new Date(Date.now() + (5 * 60 * 1000));
				session.save();
				next();
			});
		});
	});

	/* Routes */
	app.use('/', home);
	app.use('/account', account(passport));
	app.use('/auth', auth(passport));
	app.use('/image', img);

	/* Catch 404 */
	app.use('*', (req, res, next) => {
		res.render('404', {});
	});

	/* Error handler */
	app.use((err, req, res) => {
		res.locals.message = err.message; // set locals, only providing error in development
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		res.status(err.status || 500); // Pre-render the error page
		res.render('error');
	});

	/* Return Webserver-object */
	return app;
};
