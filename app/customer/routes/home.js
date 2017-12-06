'use strict';

/* Core */
const express = require('express'); // Fast, unopinionated, minimalist web framework for Node.js
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
	res.send('Welcome customer');
});

module.exports = router;
