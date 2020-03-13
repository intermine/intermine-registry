/**
 * InterMine Registry
 */
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require("passport");
const index = require('./routes/index');
const instances = require('./routes/instances');
const synchronize = require('./routes/synchronize');
const swaggerUi = require('swagger-ui-express');
require('./db/mongoose');
// Swagger.json file is used to generate the API-DOCS
const swaggerDocument = require('./swagger.json');
const scheduledAutomaticUpdate = require('./scheduled/automaticUpdate');
const auth = require('./routes/auth');
const app = express();

// Views Engine Setup: EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * ============ Middlewares =============
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// Middleware to delete URL final slash
app.use(function(req, res, next) {
   if(req.url.substr(-1) != '/' && req.url.substr(-8) == "registry" && req.url.length > 1){
       res.redirect(301, req.url + "/");
   } else{
       next();
   }
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/bootstrap-material-design/dist'));
app.use('/images', express.static(__dirname + '/node_modules/leaflet-search/images'));
app.use(express.static(__dirname + '/node_modules/leaflet-search/dist'));

//enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', index);
app.use('/service/instances', instances);
app.use('/service/synchronize', synchronize);

// 404 catcher
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;

  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// Error Handler Middlewares
app.use(function(err, req, res, next) {
  // JsonSchema not valid
  if (err.name === 'JsonSchemaValidation'){
    res.status(400).json({
        statusCode: 400,
        message: "Malformed JSON. Invalid or Missing Data.",
        friendlyMessage: "Please, fill out all the required fields.",
        executionTime: new Date().toLocaleString()
    });
    return;
  }

  // JSON is not valid
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({
        statusCode: 400,
        message: "Malformed JSON",
        friendlyMessage: "Malformed JSON",
        executionTime: new Date().toLocaleString()
    });
    return;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
