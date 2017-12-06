'use strict';

/* Core */
const express = require('express'); // Fast, unopinionated, minimalist web framework for Node.js
const router = express.Router();

const configAuth = require('../config/auth');

function isLoggedIn(req, res, next) {
	return req.isAuthenticated() ? next() : res.redirect('/login');
}

function isNotLoggedIn(req, res, next) {
	return !req.isAuthenticated() ? next() : res.redirect('/');
}

/* GET users listing. */
router.get('/', isLoggedIn, (req, res) => {
	res.render('home', {
		user: true
	});
});

/* GET users listing. */
router.get('/login', isNotLoggedIn, (req, res) => {
	res.render('login', {
		showLocal: configAuth.Local.IsEnabled,
		showFacebook: configAuth.Facebook.IsEnabled,
		showGoogle: configAuth.Google.IsEnabled
	});
});

/* GET users listing. */
router.get('/vergeten', isNotLoggedIn, (req, res) => {
	res.render('forgot', {});
});

/* GET users listing. */
router.get('/reset', isNotLoggedIn, (req, res) => {
	res.render('reset', {});
});

/* GET Logout page */
router.get('/logout', isLoggedIn, (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
