/**
 * Authentication strategies for the InterMine Registry API & Front End using passport.js
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

/**
 * FRONT END: Local Strategy
 * Local strategy require a `verify` function which receives the credentials
 * (`username` and `password`) submitted by the user. The function verify
 * that the password is correct and then invoke `done` with a user object, which
 * will be set at `req.user` in route handlers after authentication.
 */
passport.use(new Strategy(
    function(username, password, done){
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            else if(!user){
                return done(null, false, {message: "Incorrect Username"});
            }
            else{
              User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: "Incorrect Password"});
                }
              });
            }
        });
    }
));


/**
 * FRONT END: Sessions Persistence
 * In order to restore authentication state across HTTP requests, Passport needs
 * to serialize users into and deserialize users out of the session.
 */
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
	User.findOne({ '_id': id }, function(err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


/**
 * BASIC STRATEGY: API
 * Basically, its a Local Strategy that doesn't handle sessions.
 */
passport.use(new BasicStrategy(
  function(username, password, done) {
    User.findOne({ 'user': username }, function(err, user) {
      if (err) { return done(err); }
      else if (!user) {
        return done(null, false, { message: 'Incorrect Username.' });
      }
      else if (user.password != password) {
        User.comparePassword(password, user.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null, user);
            } else {
                return done(null, false, {message: "Incorrect Password"});
            }
        });
      }
      else{
        return done(null, user);
      }
    });
  }
));