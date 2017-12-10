'use strict';

/* Core */
const Express = require('express');

const crypto = require('crypto');
const User = require('../models/user');

/* Config */
const Config = require('../config/auth');

const Router = Express.Router();

module.exports = (passport) => {
	Router.get('/', (req, res) => {
		res.render('account', {
			user: req.user,
			showFacebook: Config.Facebook.IsEnabled,
			showGoogle: Config.Google.IsEnabled
		});
	});

	Router.get('/veranderen', (req, res) => {
		const token = crypto.randomBytes(20).toString('hex');

		User.findOne({
			'local.email': req.user.local.email
		}, (err, user) => {
			if (!user) {
				return res.redirect('/account');
			}

			user.local.resetPasswordToken = token;
			user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

			user.save();
		});

		res.render('reset', {
			token: token
		});
	});

	/* Facebook */
	if (Config.Facebook.IsEnabled) {
		/* Connect Facebook */
		Router.get('/connect/facebook', passport.authorize('facebook', {
			scope: 'email'
		}));

		/* Handle Callback from Facebook */
		Router.get('/connect/facebook/callback', passport.authorize('facebook', {
			successRedirect: Config.General.SuccessRedirect,
			failureRedirect: Config.General.FailureRedirect
		}));

		/* Unlink Facebook */
		Router.get('/unlink/facebook', (req, res) => {
			const user = req.user;
			user.facebook.id = undefined;
			user.facebook.token = undefined;
			user.facebook.email = undefined;
			user.facebook.name = undefined;

			user.save()
				.then(() => {
					res.redirect(Config.General.UnlinkSuccessRedirect);
				})
				.catch((err) => {
					req.flash('error', err);
					res.redirect(Config.General.UnlinkFailureRedirect);
				});
		});
	}

	/* Google */
	if (Config.Google.IsEnabled) {
		/* Connect Google */
		Router.get('/connect/google', passport.authorize('google', {
			scope: ['profile', 'email']
		}));

		/* Handle Callback from Google */
		Router.get('/connect/google/callback', passport.authorize('google', {
			successRedirect: Config.General.SuccessRedirect,
			failureRedirect: Config.General.FailureRedirect
		}));

		/* Unlink Google */
		Router.get('/unlink/google', (req, res) => {
			const user = req.user;
			user.google.id = undefined;
			user.google.token = undefined;
			user.google.email = undefined;
			user.google.name = undefined;

			user.save()
				.then(() => {
					res.redirect(Config.General.UnlinkSuccessRedirect);
				})
				.catch((err) => {
					req.flash('error', err);
					res.redirect(Config.General.UnlinkFailureRedirect);
				});
		});
	}

	return Router;
};
