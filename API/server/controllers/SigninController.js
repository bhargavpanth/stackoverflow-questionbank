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

var bcrypt = require('bcrypt');


module.exports = function(app, route) {

    router.get('/', isAuthenticated, function(req, res, next) {
        notAllowed(req, res);
        res.end();
    });

    router.post('/', function(req, res, next) {
        // var auth_token = req.headers['auth-token'];
        var email = req.body.email;
        var password = req.body.password;

        if ( email && password ) {
            // All data available
            User.findOne({ email: email }, function(err, record) {
                if (err) {
                    res.status(500);
                    console.log("internal server error");
                    res.json({
                        "status": 500,
                        "message": "internal server error"
                    });
                    res.end();
                } else {
                    if (!record) {
                        res.status(404);
                        console.log("No user was found with this email id. Please signup");
                        res.json({
                            "status": 404,
                            "message": "no user found with this email id, you can signip with it"
                        });
                        res.end();
                    } else {
                        res.status(200);
                        // Check for password using bcrypt
                        hash = record.password;
                        console.log(hash);
                        bcrypt.compare(password, hash, function(err, data) {
                            if (err) {
                                console.log("Check password error");
                                res.status(500);
                                res.json({
                                    "status": 500,
                                    "message": "internal server error"
                                });
                                res.end();
                            } else {
                                if (data) {
                                    // console.log(data);
                                    res.status(200);
                                    res.json({
                                        "status": 200,
                                        "message": "user authenticated sucessfully",
                                        "auth_token": record.auth_token
                                    });
                                    res.end();
                                } else {
                                    res.status(401);
                                    res.json({
                                        "status": 401,
                                        "message": "wrong email id or password"
                                    });
                                    res.end();
                                }
                                
                            }
                        });
                    }
                }
            });
        } else {
            console.log("invalid submission, some fields are missing");
            res.status(400);
            res.json({
                "status": "400",
                "message": "bad request, form data missing"
            });
        }
    });

    return router;
}
