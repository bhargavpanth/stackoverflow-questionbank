/**

Used to validate the access_token along with email id

Method  : facebook_validate 
Send    : access_token & email_id
Return  : true or false depending on the response body email id field

Method  :  google_validate
Send    :  access_token & email_id
Return  :  true or false depending on the response body email id field

**/

var request = require('request');


var mongoose = require('mongoose');

var _ = require('lodash');

//Obtain user_id 
// var AuthSchema = require('./models/AuthToken.js');
// var Auth = mongoose.model('authtokens', AuthSchema);

// Obtain User details
var UserSchema = require('./models/User.js');
var User = mongoose.model('User', UserSchema);

// Project schema
var ProjectSchema = require('./models/Project.js');
var Project = mongoose.model('Project', ProjectSchema);

// Test schema
var TestSchema = require('./models/Test.js');
var Test = mongoose.model('Test', TestSchema);

// var mandrill = require('mandrill-api/mandrill');
// var mandrill_client = new mandrill.Mandrill('KUbOuKyqRMgYTjkmp5tu1w');
// Key : KUbOuKyqRMgYTjkmp5tu1w

// var html = require('./views/apply_email.ejs');

var crypto = require('crypto');

function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

function robohash(text) {
    var profile_picture_url = "https://robohash.org/" + checksum(String(text));
    return profile_picture_url;
}



var google_validate = function(access_token, callback) {
    var baseURL = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=";
    var verify_url = baseURL + access_token;
    request(verify_url, function(error, response, body) {
        var data = JSON.parse(body);
        if (error) {
            callback(error, null);
            return;
        }
        //Check for right status code
        if (response.statusCode === 200) {
            // console.log('Valid Status Code Returned:', response.statusCode);
            //res.send(response.statusCode);
            callback(null, {
                status: true,
                email: data.email,
                picture: data.picture,
                name: data.name
            });
        } else {
            // console.log(data);
            var err = new Error(data.error.message);
            callback(err, {
                status: false,

            });
        }
    });
}

var facebook_validate = function(access_token, callback) {
    var baseURL = "https://graph.facebook.com/me?fields=name,email,picture&access_token=";
    var verify_url = baseURL + access_token;
    request(verify_url, function(error, response, body) {
        if (error) {
            callback(error, null);
            return;
        }
        var data = JSON.parse(body);
        //Check for status code 200
        // console.log(data);
        if (response.statusCode === 200) {
            var picture = data.picture.data;
            var email = data.email;
            var name = data.name;
            if (!email) {
                callback(new Error('no email permission'), {
                    status: false
                });
                return;

            } else {
                if (picture.is_silhouette) {
                    picture.url = robohash(body.email);
                }
                callback(null, {
                    status: true,
                    email: email,
                    picture: picture.url,
                    name: name
                });
            }
        } else {
            callback(new Error(data.error.message), {
                status: false
            });
            return;
        }
    });
}

// var custom_validate = function(flag,callback){

// }

function notAllowed(req, res, callback) {
    res.status(405);
    res.json({
        "status": false,
        "message": "method not allowed"
    });
    res.end();
}

var isAuthenticated = function(req, res, next) {
    var auth_token = req.headers['auth-token'];
    // console.log(auth_token);
    // console.log(req.body);

    if (!auth_token) {
        res.status(401);
        res.json({
            "status": false,
            "message": "missing auth-token"
        });
        res.end();
    } else {
        User.findOne({
            'auth_token': auth_token
        }, function(err, data) {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({
                    "status": 500,
                    "message": "internal server error"
                });
                res.end();
            } else {
                if (!data) {
                    res.status(401);
                    res.json({
                        "status": false,
                        "message": "invalid auth-token"
                    });
                    res.end();
                } else {
                    // console.log(data);
                    var user_id = data._id;
                    var auth = data.auth_token;
                    // console.log(auth);
                    User.findOne({
                        '_id': user_id
                    }, function(err, record) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (!record) {
                                res.status(401);
                                res.json({
                                    "status": false,
                                    "message": "invalid auth-token"
                                });
                                res.end();
                            } else {
                                req.user = record;
                                next();
                            }
                        }
                    });
                }
            }
        });
    }

}

function isAdmin(req, res, next) {
    if (req.user.user_type === "admin") {
        next();
    } else {
        res.json({
            "status": false,
            "message": "not an admin"
        });
        res.end();
    }
}


function hasDuplicates(a) {
    return _.uniq(a).length !== a.length;
}

function updateUser(email, name, token, callback) {

    User.findOneAndUpdate({
        'email': email
    }, {
        $set: {
            email: email,
            name: name,
            auth_token: token
        }
    }, {
        new: true,
        upsert: true,
        passRawResult: true
    }, function(err, user) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, user);
        }

    });
}

var project_exist = function(req, res, next){
    var project_id = req.headers['pid'];
    if (!project_id) {
        res.status(400);
        res.json({
            "status": 400,
            "message": "missing project id"
        });
        res.end();
    } else {
        Project.findOne({
            'project_id': project_id
        }, function(err, data){
            if (err) {
                res.status(500);
                res.json({
                    "status": 500,
                    "message": "internal server error"
                });
                res.end();
            } else {
                if (!data) {
                    res.status(401);
                    res.json({
                        "status": 401,
                        "message": "invalid project id"
                    });
                    res.end();
                } else {
                    var id = data.project_id;
                    console.log("Project ID " + id);
                    if (id) {
                        Project.findOne({
                            'project_id': id
                        }, function(err, rec){
                            if (err) {
                                console.log(err);
                                res.status(500);
                                res.json({
                                    "status": 500,
                                    "message": "internal server error"
                                });
                                res.end();
                            } else {
                                req.project = rec;
                                next();
                            }
                        });
                    } else {
                        res.status(404);
                        res.json({
                            "status": 404,
                            "message": "project not found"
                        });
                        res.end();
                    }
                }
            }
        });
    }
}

// exporting methods
exports.google_validate = google_validate;
exports.facebook_validate = facebook_validate;
exports.isAuthenticated = isAuthenticated;
exports.notAllowed = notAllowed;
exports.isAdmin = isAdmin;
exports.updateUser = updateUser;
exports.project_exist = project_exist;
