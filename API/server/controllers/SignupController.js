var express = require('express');
var app = express();
var router = express.Router();

var mongoose = require('mongoose');
var hat = require('hat');

var UserSchema = require('../models/User.js');
var User = mongoose.model('User', UserSchema);


var utils = require('../utils.js');
var isAuthenticated = utils.isAuthenticated;
var notAllowed = utils.notAllowed;
var updateUser = utils.updateUser;

var bcrypt = require('bcrypt');

module.exports = function(app, route) {

    router.get('/', function(req, res, next) {
        notAllowed(req, res);
    });

    router.post('/', function(req, res, next) {
        // var access_token = req.body.access_token;
        // var flag = req.body.flag;
            var name = req.body.user_name;
            var email = req.body.email;
            var password = req.body.password;
            var phone_number = req.body.phone;
            var address = req.body.address;
            var affiliation = req.body.affiliation;

            if (name && email && password && phone_number && address && affiliation) {
                // console.log(name);
                // console.log(email);
                // console.log(password);

                User.findOne({
                    'email': email
                }, function(err, data) {
                    if (err) {
                        // console.log(err);
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
                                "message": "You have already signed up with this account, please use your credentails to login"
                            });
                        } else {
                                var auth = hat();
                                saltRounds = 10;
                                var hash = bcrypt.hashSync(password,saltRounds);
                                
                                User.findOneAndUpdate({
                                    'email': email
                                }, {
                                    $set: {
                                        email: email,
                                        name: name,
                                        auth_token: auth,
                                        password: hash,
                                        phone_number: phone_number,
                                        address: address,
                                        affiliation: affiliation
                                    }
                                }, {
                                    new: true,
                                    upsert: true,
                                    passRawResult: true
                                }, function(err, user) {
                                    if (err) {
                                        res.status(500);
                                        res.json({
                                            "status": 500,
                                            "message": "internal server error"
                                        });
                                        res.end();
                                    } else {
                                        res.status(200);
                                        res.json({
                                            "status": 200,
                                            "auth_token": auth,
                                            "email": email,
                                            "name": name,
                                            // "password":hash
                                        });
                                        res.end();
                                    }

                                });
                        }
                    }
                });
            } else {
                res.status(400);
                res.json({
                    "status": false,
                    "message": "insufficient data"
                });
                res.end();
            }
    });
    return router;

}
