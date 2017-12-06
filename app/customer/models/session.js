'use strict';

/* Database */
const mongoose = require('mongoose');
const Config = require('../config/database');

const DB = mongoose.connect(Config.MongoDB.URL, {
	useMongoClient: true
});

const sessionSchema = mongoose.Schema({
	process: {
		type: String,
		required: true
	},
	sessionID: {
		type: String,
		required: true,
		unique: true
	},
	last_seen: {
		type: Date,
		required: true
	}
});

module.exports = DB.model('Session', sessionSchema);
