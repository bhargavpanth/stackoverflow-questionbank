var express = require('express');
var app = express();
var router = express.Router();

var mongoose = require('mongoose');

// Utils
var utils = require('../utils.js');
var isAuthenticated = utils.isAuthenticated;
var notAllowed = utils.notAllowed;
var project_exist = utils.project_exist;

// User Schema
var UserSchema = require('../models/User.js');
var User = mongoose.model('User', UserSchema);

// Project Schema
var ProjectSchema = require('../models/Project.js');
var Project = mongoose.model('Project', ProjectSchema);

// Test Schema
var TestSchema = require('../models/Test.js');
var Test = mongoose.model('Test', TestSchema);

module.exports = function(app, route) {
	
	router.get('/', isAuthenticated, function(req, res, next){
		res.status(200);
		res.json({
			"Test Strategy": false,
			"Test Plan": false,
			"Test Cases": false,
			"Unit Testing": false,
			"Functional Testing": false,
			"Test Automation": false,
			"Performance Testing": false,
			"Security Testing": false,
			"Compatibility Testing": false,
			"Compliance Testing": false,
			"User Acceptance Testing": false
		});
		res.end();
	});
	
	router.post('/', isAuthenticated, project_exist, function(req, res, next){
		// var project_name = req.body.project_name;
		var options = req.body.options;
		var auth_token = req.headers['auth-token'];
		var project_id = req.headers['pid'];
		if (options && auth_token) {
			if (options.length == 0) {
				res.status(400);
				res.json({
					"status": 400,
					"message": "at least one option must be selected"
				});
				res.end();
			} else {
				Test.collection.insert({
					auth_token: auth_token,
					project_id: project_id,
					options: options
				}, function(err, data){
					if (err) {
						res.status(500);
						res.json({
							"status": 500,
							"message": "internal server error"
						});
						res.end();
					} else {
						if (data) {
							res.status(200);
							res.json({
								"status": 200,
								"message": "test options have been added"
							});
							res.end();
						} else {
							res.status(400);
							res.json({
								"status": 400,
								"message": "bad request"
							});
							res.end();
						}
					}
				});
			}
		} else {
			res.status(400);
			res.json({
				"status": 400,
				"message": "invalid request"
			});
			res.end();
		}
	});
	return router;
}