var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var _ = require('lodash');
var fs = require('fs');
var S3FS = require('s3fs');
var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();
// S3 bucket dump
var s3fsImpl = new S3FS('BucketName', { accessKeyId:'', secretAccessKey:''});

// Create the application.
var app = express();

app.set('view engine', 'ejs');

var morgan = require('morgan');
var logger = morgan('combined');

app.use(multipartyMiddleware);

function errorHandler(err, req, res, next) {
    res.status(500);
    res.json({
        error: err
    });
    res.end();
}

app.use(logger);

// CORS Support
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,auth-token');
    next();
});

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser());
app.use(errorHandler);


if (process.env.PORT) {
    console.log('No remote set up');
} else {
    mongoose.connect('mongodb://localhost:27017/comcast');
    console.log('connected to comcast');
}


Object.defineProperty(Error.prototype, 'toJSON', {
    value: function() {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function(key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true
});

mongoose.connection.once('open', function() {
    app.models = require('./models/index');
    var routes = require('./routes');
    _.each(routes, function(controller, route) {
        console.log(route);
        app.use(route, controller(app, route));
    });
    var port = process.env.PORT || 3000;
    console.log('Listening on port ' + port);
    app.listen(port);
});

// app.get('/', function(req, res, next){
//     res.render('index');
// });