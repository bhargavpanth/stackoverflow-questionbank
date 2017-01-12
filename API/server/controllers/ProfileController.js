var express = require('express');
var app = express();
var router = express.Router();

var mongoose = require('mongoose');

// Utils
var utils = require('../utils.js');
var isAuthenticated = utils.isAuthenticated;
var notAllowed = utils.notAllowed;

// User Schema
var UserSchema = require('../models/User.js');
var User = mongoose.model('User', UserSchema);


module.exports = function(app, route) {
	router.get('/', isAuthenticated, function(req, res, next){
		// Ongoing projects and Completed projects
		var auth_token = req.headers['auth-token'];

	});

	router.post('/', isAuthenticated, function(req, res, next){
		notAllowed(req,res);
	});

	return router;
}