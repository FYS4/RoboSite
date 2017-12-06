'use strict';

/* Configs */
const Config = require('../../config').Mail;

/* Utility */
const sendgrid = require('@sendgrid/mail');
const Validator = require('validator');

function Mail() {
	sendgrid.setApiKey(Config.ApiKey);
}

Mail.prototype.setTargetMail = email => new Promise((resolve, reject) => {
	if (!Validator.isEmail(email)) {
		reject(new Error('Invalid mail format!'));
	}
	this.targetMail = email;
	resolve(this);
});

Mail.prototype.setSourceMail = email => new Promise((resolve, reject) => {
	if (!Validator.isEmail(email)) {
		reject(new Error('Invalid mail format!'));
	}
	this.sourceMail = email;
	resolve(this);
});

Mail.prototype.setSubject = subject => new Promise((resolve) => {
	this.mailSubject = subject;
	resolve(this);
});

Mail.prototype.setMessage = message => new Promise((resolve) => {
	this.mailMessage = message;
	resolve(this);
});

Mail.prototype.send = () => new Promise((resolve, reject) => {
	if (!this.targetMail || !this.sourceMail || (!this.mailSubject && !this.mailMessage)) {
		return reject(new Error('Missing parameters!'));
	}

	const MessageObject = {
		to: this.targetMail,
		from: this.sourceMail,
		subject: this.mailSubject,
		text: this.mailMessage
	};

	sendgrid.send(MessageObject)
		.then(() => {
			resolve(this);
		})
		.catch((err) => {
			reject(err);
		});
});

module.exports = Mail;
