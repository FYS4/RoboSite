'use strict';

/* Core */
const Express = require('express');

const router = Express.Router();

/* Utility */
const async = require('async');
const crypto = require('crypto');

/* Models */
const Mail = require('../models/mail');
const User = require('../models/user');

/* Config */
const ConfigAuth = require('../config/auth');

module.exports = (passport) => {
	router.get('/new/:user/:pass', (req, res, next) => {
		User.findOne({
			'local.email': req.params.user
		}, (err, user) => {
			if (user) {
				user.local.password = user.generateHash(req.params.pass);
				user.save();
				return res.redirect('/');
			}

			const newUser = new User();
			newUser.local.email = req.params.user;
			newUser.local.password = user.generateHash(req.params.pass);

			newUser.save()
				.then(() => {
					res.redirect('/');
				})
				.catch((err) => {
					next(err);
				});
		});
	});

	router.post('/reset/:token', (req, res, next) => {
		async.waterfall([
			function(done) {
				User.findOne({
					'local.resetPasswordToken': req.params.token,
					'local.resetPasswordExpires': {
						$gt: Date.now()
					}
				}, (err, user) => {
					if (err) {
						return next(err);
					}

					if (!user) {
						req.flash('error', 'Password reset token is invalid or has expired.');
						return res.redirect('/');
					}

					user.local.password = user.generateHash(req.body.password);
					user.local.resetPasswordToken = undefined;
					user.local.resetPasswordExpires = undefined;

					user.save((err) => {
						req.logIn(user, (err) => {
							done(err, user);
						});
					});
				});
			},
			function(user, done) {
				const NotificationMail = new Mail();
				NotificationMail.setTargetMail(user.local.email)
					.then(() => NotificationMail.setSourceMail('no-reply@robobooth.nl'))
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => NotificationMail.setSubject('RoboBooth Wachtwoord Reset'))
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => NotificationMail.setMessage(`Hello,\n\n This is a confirmation that the password for your account ${user.local.email} has just been changed.`))
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => NotificationMail.send())
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => {
						req.flash('success', 'Success! Your password has been changed.');
						done(null, 'done');
					})
					.catch((err) => {
						done(`${err}`, 'done');
					});
			}
		], (err) => {
			res.redirect('/');
		});
	});

	router.post('/forgot', (req, res, next) => {
		async.waterfall([
			function(done) {
				crypto.randomBytes(20, (err, buf) => {
					const token = buf.toString('hex');
					done(err, token);
				});
			},
			function(token, done) {
				User.findOne({
					'local.email': req.body.email
				}, (err, user) => {
					if (!user) {
						req.flash('msg', 'Geen gebruiker gevonden.');
						return res.redirect('/vergeten');
					}

					user.local.resetPasswordToken = token;
					user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

					user.save((err) => {
						done(err, token, user);
					});
				});
			},
			function(token, user, done) {
				const ResetMail = new Mail();
				ResetMail.setTargetMail(user.local.email)
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => ResetMail.setSourceMail('support@robobooth.nl'))
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => ResetMail.setSubject('RoboBooth Wachtwoord Reset'))
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => ResetMail.setMessage(`${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://'}${req.headers.host}/reset/${token}\n\n` +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'))
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => ResetMail.send())
					.catch((err) => {
						done(`${err}`, 'done');
					})
					.then(() => {
						req.flash('msg', `An e-mail has been sent to ${user.local.email} with further instructions.`);
						done(null, 'done');
					})
					.catch((err) => {
						done(`${err}`, 'done');
					});
			}
		], (err) => {
			if (err) return next(err);
			res.redirect('/');
		});
	});

	if (ConfigAuth.Local.IsEnabled) {
		router.post('/login', passport.authenticate('local-login', {
			successRedirect: ConfigAuth.General.SuccessRedirect,
			failureRedirect: ConfigAuth.General.FailureRedirect,
			failureFlash: true
		}));
	}

	if (ConfigAuth.Facebook.IsEnabled) {
		/* Facebook */
		router.get('/facebook', passport.authenticate('facebook', {
			scope: ['publish_actions', 'email']
		}));

		/* Facebook Callback */
		router.get('/facebook/callback', passport.authenticate('facebook', {
			successRedirect: ConfigAuth.General.SuccessRedirect,
			failureRedirect: ConfigAuth.General.FailureRedirect
		}));
	}

	if (ConfigAuth.Google.IsEnabled) {
		/* Google */
		router.get('/google', passport.authenticate('google', {
			scope: ['profile', 'email']
		}));

		/* Google Callback */
		router.get('/google/callback', passport.authenticate('google', {
			successRedirect: ConfigAuth.General.SuccessRedirect,
			failureRedirect: ConfigAuth.General.FailureRedirect
		}));
	}

	router.all('*', (req, res) => {
		res.redirect('/');
	});

	return router;
};
