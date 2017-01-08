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

// Project Schema
var ProjectSchema = require('../models/Project.js');
var Project = mongoose.model('Project', ProjectSchema);

module.exports = function(app, route) {
	router.get('/', isAuthenticated, function(req, res, next){
		// Ongoing projects and Completed projects
		var auth_token = req.headers['auth-token'];
		Project.collection.find({
			"auth_token": auth_token
		},function(err, data){
			if (err) {
				res.status(500);
				res.json({
					"status": 500,
					"message": "internal server error"
				});
				res.end();
			} else {
				console.log(data.project_name);
				if (!data) {
					res.status(404);
					res.json({
						"status": 404,
						"message": "no data found"
					});
					res.end();
				} else {
					res.status(200);
					res.json({
						"status": 200,
						"project_name": [data.project_name],
						"project_created_time": [data.create_time]
					});
					res.end();
				}
			}
		});
	});

	router.post('/', isAuthenticated, function(req, res, next){
		notAllowed(req,res);
	});

	return router;
}