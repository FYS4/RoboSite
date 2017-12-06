'use strict';

/* Authentication */
const Passport = require('passport');

/* Authentication Strategies */
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

/* Models */
const User = require('../models/user');

/* Config */
const ConfigAuth = require('./auth');

Passport.serializeUser((user, done) => {
	done(null, user.id);
});

Passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

if (ConfigAuth.Local.IsEnabled) {
	const LocalLogin = new LocalStrategy(ConfigAuth.Local.AuthenticationObject, (req, email, password, done) => {
		User.findOne({
			'local.email': email.toLowerCase()
		}, (err, user) => {
			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, req.flash('msg', 'Geen gebruiker gevonden.'));
			}

			if (!user.validPassword(password)) {
				return done(null, false, req.flash('msg', 'Oops! Verkeerd wachtwoord.'));
			}

			return done(null, user);
		});
	});

	Passport.use('local-login', LocalLogin);
}

if (ConfigAuth.Facebook.IsEnabled) {
	const FacebookLogin = new FacebookStrategy(ConfigAuth.Facebook.AuthenticationObject, (req, token, refreshToken, profile, done) => {
		process.nextTick(() => {
			if (!req.user) {
				User.findOne({
					'facebook.id': profile.id
				}, (err, user) => {
					if (err) {
						return done(err);
					}

					if (!user) {
						return done(null, false, req.flash('msg', 'No RoboBooth account was linked with this Facebook account!'));
					}

					if (!user.facebook.token) {
						user.facebook.token = token;
						user.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
						user.facebook.email = (profile.emails[0].value || '').toLowerCase();

						user.save((err) => {
							if (err) {
								return done(err);
							}

							return done(null, user);
						});
					}

					return done(null, user);
				});
			} else {
				const user = req.user;

				user.facebook.id = profile.id;
				user.facebook.token = token;
				user.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
				user.facebook.email = (profile.emails[0].value || '').toLowerCase();

				user.save((err) => {
					if (err) {
						return done(err);
					}

					return done(null, user);
				});
			}
		});
	});

	Passport.use(FacebookLogin);
}

if (ConfigAuth.Google.IsEnabled) {
	const GoogleLogin = new GoogleStrategy(ConfigAuth.Google.AuthenticationObject, (req, token, refreshToken, profile, done) => {
		process.nextTick(() => {
			if (!req.user) {
				User.findOne({
					'google.id': profile.id
				}, (err, user) => {
					if (err) {
						return done(err);
					}

					if (!user) {
						return done(null, false, req.flash('msg', 'No RoboBooth account was linked with this Google account!'));
					}

					if (!user.google.token) {
						user.google.token = token;
						user.google.name = profile.displayName;
						user.google.email = (profile.emails[0].value || '').toLowerCase();

						user.save((err) => {
							if (err) {
								return done(err);
							}

							return done(null, user);
						});
					}

					return done(null, user);
				});
			} else {
				const user = req.user;

				user.google.id = profile.id;
				user.google.token = token;
				user.google.name = profile.displayName;
				user.google.email = (profile.emails[0].value || '').toLowerCase();

				user.save((err) => {
					if (err) {
						return done(err);
					}

					return done(null, user);
				});
			}
		});
	});
	Passport.use(GoogleLogin);
}

module.exports = Passport;
