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

    router.get('/', isAuthenticated, function(req, res, next) {
        // notAllowed(req, res);
        // res.end();
        var auth_token = req.headers['auth-token'];
        User.findOne({ auth_token: auth_token }, function(err, data) {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({
                    "status": 500,
                    "message": "internal server error"
                });
                res.end();
            } else {
                res.status(200);
                res.json({
                    "name": data.name,
                    "email": data.email,
                    "address": data.address
                });
                res.end();
            }
        });
    });

    router.post('/', isAuthenticated, function(req, res, next) {
        var auth_token = req.headers['auth-token'];
        var phone_number = req.body.phone;
        var address = req.body.address;
        var affiliation = req.body.affiliation;

        if (phone_number && address && affiliation) {
            // All data available
            User.findOne({ auth_token: auth_token }, function(err, data) {
                if (err) {
                    res.status(500);
                    console.log("internal server error");
                    res.json({
                        "status": 500,
                        "message": "internal server error"
                    });
                    res.end();
                } else {
                    if (!data) {
                        res.status(404);
                        console.log("no user found with this auth token");
                        res.json({
                            "status": 404,
                            "message": "no user found with this auth token"
                        });
                        res.end();
                    } else {
                        res.status(200);
                        // console.log("auth token :" + data.user_id);
                        // res.json({
                        //     "status": 200,
                        //     "user_id": data.user_id
                        // });
                        var auth = data.auth_token;
                        User.findOneAndUpdate({
                            'auth_token': auth
                        }, {
                            $set: {
                                phone_number: phone_number
                            }
                        }, function(err, record) {
                            if (err) {
                                res.status(500);
                                console.log("internal server occured");
                                res.json({
                                    "status": 500,
                                    "message": "internal server error"
                                });
                                res.end();
                            } else {
                                res.status(200);
                                console.log("updated user details");
                                res.json({
                                    "status": 200,
                                    "message": "updated user details"
                                });
                                res.end();
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
