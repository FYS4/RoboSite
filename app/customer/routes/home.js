'use strict';

/* Core */
const express = require('express'); // Fast, unopinionated, minimalist web framework for Node.js
const router = express.Router();

const config = require('../../config').Authentication;

/* GET users listing. */
router.get('/', (req, res) => {
  res.render('home', {
    user: true
  });
});

/* GET users listing. */
router.get('/login', (req, res) => {
  res.render('login', {
    showLocal: config.Local.Enabled,
    showFacebook: config.Facebook.Enabled,
    showGoogle: config.Google.Enabled,
  });
});

/* GET users listing. */
router.get('/vergeten', (req, res) => {
  res.render('forgot', {});
});

/* GET users listing. */
router.get('/reset', (req, res) => {
  res.render('reset', {});
});

module.exports = router;
