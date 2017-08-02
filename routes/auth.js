var express = require('express');
var router = express.Router();
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

passport.use(new BasicStrategy(
  function(username, password, callback) {
    User.findOne({ user: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect Username.' });
      }
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect Password.' });
      }
      return done(null, user);
    });
  }
));

//module.exports.isAuthenticated = passport.authenticate('basic', {session: false});
