'use strict';

const Config = require('../../config').Database;

const MongoDB = {
	URL: `mongodb://${Config.MongoDB.User}:${Config.MongoDB.Pass}@${Config.MongoDB.Host}:${Config.MongoDB.Port}/${Config.MongoDB.Name}`
};

const Redis = {
	host: Config.Redis.Host,
	port: Config.Redis.Port,
	pass: Config.Redis.Pass,
	db: 0
};

exports.MongoDB = MongoDB;
exports.Redis = Redis;
