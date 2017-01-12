var mongoose = require('mongoose');

// Utils
var utils = require('../utils.js');
var isAuthenticated = utils.isAuthenticated;
var notAllowed = utils.notAllowed;

// User 
var UserSchema = require('../models/User.js');
var User = mongoose.model('User', UserSchema);

// Question
var QuestionSchema = require('../models/Question.js');
var Questions = mongoose.model('Question', QuestionSchema);

 