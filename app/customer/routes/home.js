'use strict';

/* Core */
const express = require('express'); // Fast, unopinionated, minimalist web framework for Node.js
const path = require('path'); // Provides utilities for working with file and directory paths
const fileSystem = require('fs');

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
	const UsersFolder = path.resolve(__dirname, '../private');
	  if (!fileSystem.existsSync(UsersFolder)) {
	    fileSystem.mkdirSync(UsersFolder);
	  }

	  const UserFolder = path.resolve(UsersFolder, req.user.local.email);
	  if (!fileSystem.existsSync(UserFolder)) {
	    fileSystem.mkdirSync(UserFolder);
	  }

	  const Images = [];
	  const ImageIndex = [];
	  const ImageNames = [];

	  fileSystem.readdir(`${UserFolder}/`, (err, files) => {
	    if (err) {
	      return next(err);
	    }

	    for (let i = 0; i < files.length; i += 1) {
	      const FileName = files[i].replace('.jpg', '').replace('-10.webp', '').replace('-25.webp', '').replace('-50.webp', '')
	        .replace('-75.webp', '');

	      if (ImageNames.indexOf(FileName) < 0) {
	        ImageNames.push(FileName);

	        const ImageObject = FileName.split('_');
	        if (ImageObject.length === 3) {
	          /* Image Date Info */
	          const DateObject = ImageObject[0];
	          const Year = DateObject.substr(0, 4);
	          const Month = DateObject.substr(4, 2);
	          const Day = DateObject.substr(6, 2);
	          const PrettyDate = `${Day} - ${Month} - ${Year}`;

	          /* Image Time Info */
	          const TimeObject = ImageObject[1];
	          const Hour = TimeObject.substr(0, 2);
	          const Minute = TimeObject.substr(2, 2);
	          const Second = TimeObject.substr(4, 2);
	          const PrettyTime = `${Hour}:${Minute}:${Second}`;

	          /* Image Place Info */
	          const Place = ImageObject[2];

	          /* Header Info */
	          const Title = `${Year} ${Place}`;

	          /* Add Header and Create Object */
	          if (ImageIndex.indexOf(Title) < 0) {
	            Images.push([]);
	            ImageIndex.push(Title);
	            Images[ImageIndex.indexOf(Title)].push(Title);
	          }

	          /* Add Image to Object */
	          Images[ImageIndex.indexOf(Title)].push({
	            file: FileName,
	            title: `${PrettyDate} - ${PrettyTime}`
	          });
	        }
	      }
	    }

	    return true;
	  });

	  return res.render('home', {
	    successMessage: req.flash('success'),
	    user: req.user,
	    currentPage: 'home',
	    images: Images.reverse()
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
