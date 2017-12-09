'use strict';

/* Core */
const Express = require('express');

const Router = Express.Router();

/* Utility */
const Path = require('path');
const FileSystem = require('fs');
const Converter = require('webp-converter');
const Request = require('request');

const AllowedScales = [10, 25, 50, 75];
let UserFolder = null;

Router.use((req, res, next) => {
	UserFolder = Path.resolve(__dirname, '../private', req.user.local.email);
	if (!FileSystem.existsSync(UserFolder)) {
		FileSystem.mkdirSync(UserFolder);
	}
	next();
});

Router.get('/delete/:foto', (req, res, next) => {
	const Files = FileSystem.readdirSync(`${UserFolder}/`);

	for (let i = 0; i < Files.length; i += 1) {
		let fileName = Files[i].replace('.jpg', '');

		for (let j = 0; j < AllowedScales.length; j += 1) {
			fileName = fileName.replace(`-${AllowedScales[j]}.webp`, '');
		}

		if (req.params.foto === fileName) {
			const UserImage = Path.resolve(UserFolder, Files[i]);
			FileSystem.unlinkSync(UserImage, (err) => {
				if (err) {
					return next(err);
				}
			});
		}
	}
	res.redirect('/');
});

Router.get('/download/:foto', (req, res, next) => {
	const Image = Path.resolve(UserFolder, `${req.params.foto}.jpg`);

	if (!FileSystem.existsSync(Image)) {
		return next(new Error('Image not found!'));
	}

	res.download(Image);
});

Router.get('/load/:scale/:foto', (req, res, next) => {
	/* IE and Edge don't support webp format */
	if (req.headers['user-agent'].indexOf('Edge') >= 0 || req.headers['user-agent'].indexOf('Trident') >= 0) {
		req.params.scale = 0;
	}

	/* Don't use compression */
	if (req.params.scale === 0) {
		const Image = Path.resolve(UserFolder, `${req.params.foto}.jpg`);
		if (!FileSystem.existsSync(Image)) {
			return next(new Error('Image not found!'));
		}

		res.type('jpg');
		return res.sendFile(Image);
	}

	req.params.scale = parseInt(req.params.scale, 10);
	if (req.params.scale < 1 || req.params.scale > 100 || !req.params.scale) {
		req.params.scale = 10;
	}

	let UserScale = AllowedScales[0];
	let oldDiff = Math.abs(parseInt(req.params.scale, 10) - UserScale);
	for (let i = 0; i < AllowedScales.length; i += 1) {
		const NewDiff = Math.abs(parseInt(req.params.scale, 10) - AllowedScales[i]);
		if (NewDiff < oldDiff) {
			oldDiff = NewDiff;
			UserScale = AllowedScales[i];
		}
	}

	const Image = Path.resolve(UserFolder, req.params.foto);
	const ImageOriginal = `${Image}.jpg`;

	if (!FileSystem.existsSync(ImageOriginal)) {
		return next(new Error('Image not found!'));
	}

	/* Found Scaled Image */
	const ImageScaled = `${Image}-${UserScale}.webp`;
	if (FileSystem.existsSync(ImageScaled)) {
		res.type('image/webp');
		return res.sendFile(ImageScaled);
	}

	/* Scale The Original Image */
	Converter.cwebp(ImageOriginal, ImageScaled, `-q ${UserScale}`, (status) => {
		if (parseInt(status, 10) !== 100) {
			res.type('jpg');
			return res.sendFile(ImageOriginal);
		}

		res.type('image/webp');
		res.sendFile(ImageScaled);
	});
});

Router.get('/share/:foto', (req, res, next) => {
	const UserImage = Path.resolve(UserFolder, `${req.params.foto}.jpg`);

	if (!FileSystem.existsSync(UserImage)) {
		return next(new Error('Image not found!'));
	}

	const FacebookObject = {
		url: `https://graph.facebook.com/me/photos?access_token=${req.user.facebook.token}`,
		formData: {
			message: 'Een vakantiekiekje gemaakt door de RoboBooth!',
			source: FileSystem.createReadStream(UserImage)
		}
	};

	Request.post(FacebookObject, (error, response, body) => {
		if (error) {
			return next(error);
		}

		const bodyJSON = JSON.parse(body);
		if (bodyJSON.error) {
			return next(new Error(bodyJSON.error));
		}
	});

	res.redirect(`/image/view/${req.params.foto}`);
});

Router.get('/view/:foto', (req, res) => res.render('image', {
	user: req.user.local.email,
	img: req.params.foto
}));

module.exports = Router;
