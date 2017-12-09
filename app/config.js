'use strict';

module.exports = {
	Authentication: {
		General: {
			SuccessRedirect: '/',
			FailureRedirect: '/',
			UnlinkSuccessRedirect: '/account',
			UnlinkFailureRedirect: '/account'
		},

		Local: {
			Enabled: true
		},

		// NOTE: https://developers.facebook.com/apps/
		Facebook: {
			Enabled: true,
			AppID: '1954282114860366',
			AppSecret: '5cde3b51db7de90444edecfb4388ee1d'
		},

		// NOTE: https://console.developers.google.com/apis
		Google: {
			Enabled: true,
			ClientID: '416975212420-5j5ihuuv47emb4k5ga1kvdjj0ebkh121.apps.googleusercontent.com',
			ClientSecret: 'sf3_TRtBWaMJLPRfbwp7FDhN'
		},

		// NOTE: https://apps.twitter.com/
		Twitter: {
			Enabled: true,
			ConsumerKey: 'O5nLF39tuf11trPC6ogMpfSoC',
			ConsumerSecret: 'cGBUJpo9gdvkMzwFcqSn2tJfTKOLGmx74i7xX64pU9wkjXnty5'
		}
	},

	Database: {
		MongoDB: {
			Host: 'ds040837.mlab.com',
			Port: 40837,
			User: 'root',
			Pass: 'admin',
			Name: 'robobooth'
		},

		Redis: {
			Host: 'redis-10600.c3.eu-west-1-1.ec2.cloud.redislabs.com',
			Port: 10600,
			Pass: ''
		}
	},

	// NOTE: Sendgrid
	Mail: {
		ApiKey: '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'
	},

	Server: {
		Address: 'http://localhost/',
		Port: {
			Customer: 80,
			Employee: 3000
		}
	}
};
