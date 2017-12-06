'use strict';

const Config = require('../../config').Authentication;
const Server = require('../../config').Server;

const General = {
	SuccessRedirect: Config.General.SuccessRedirect,
	FailureRedirect: Config.General.FailureRedirect,
	UnlinkSuccessRedirect: Config.General.UnlinkSuccessRedirect,
	UnlinkFailureRedirect: Config.General.UnlinkFailureRedirect
};

const LocalAuth = {
	IsEnabled: Config.Local.Enabled,
	AuthenticationObject: {
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}
};

const FacebookAuth = {
	IsEnabled: Config.Facebook.Enabled,
	AuthenticationObject: {
		clientID: '1954282114860366',
		clientSecret: '5cde3b51db7de90444edecfb4388ee1d',
		callbackURL: `${Server.Address}auth/facebook/callback`,
		profileURL: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
		passReqToCallback: true
	}
};

const GoogleAuth = {
	IsEnabled: Config.Google.Enabled,
	AuthenticationObject: {
		clientID: '416975212420-5j5ihuuv47emb4k5ga1kvdjj0ebkh121.apps.googleusercontent.com',
		clientSecret: 'sf3_TRtBWaMJLPRfbwp7FDhN',
		callbackURL: `${Server.Address}auth/google/callback`,
		passReqToCallback: true
	}
};

exports.General = General;
exports.Local = LocalAuth;
exports.Facebook = FacebookAuth;
exports.Google = GoogleAuth;
