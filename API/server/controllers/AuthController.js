var express = require('express');
var app = express();
var router = express.Router();

var mongoose = require('mongoose');

var utils = require('../utils.js');
var isAuthenticated = utils.isAuthenticated;
var notAllowed = utils.notAllowed;


module.exports = function(app, route) {

    router.get('/', function(req, res, next) {
        notAllowed(req, res);
    });

    router.post('/', isAuthenticated, function(req, res, next) {
        res.status(200);
        res.json({
            "status": true,
            "email": req.user.email,
            "name": req.user.name,
            "picture": req.user.picture
        });
        res.end();
    });

    return router;
}
