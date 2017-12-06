'use strict';

/* Routes */
const home = require('./home');
const auth = require('./auth');

module.exports = (app, passport) => {
	/* Routes */
	app.use('/', home);
	app.use('/auth', auth(passport));

	/* Catch 404 and forward to error handler */
	app.use((req, res, next) => {
		const err = new Error('Not Found');
		err.status = 404;
		next(err);
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
