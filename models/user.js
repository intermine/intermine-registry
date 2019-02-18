/**
 * User Model
 */
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var mongoose = require('mongoose');

// Schema Modeling
var Schema = mongoose.Schema;
var schema = new Schema({
    user: {
    	type : String,
    	required : true,
      unique: true
    },
    password: String
},
{
    collection: 'users'
});


var User = module.exports = mongoose.model("User", schema);

module.exports.createUser = function(newUser, callback) {
    bcrypt.hash(newUser.password, SALT_WORK_FACTOR, function(err, hash) {
      if (err) return err;
      // override the cleartext password with the hashed one
      newUser.password = hash;
      newUser.save(callback);
    });
}


module.exports.comparePassword = function(candidatePassowrd, hash, callback){
    bcrypt.compare(candidatePassowrd, hash, function(err, isMatch){
        if(err) return callback(err);
        callback(null, isMatch);
    });
}

module.exports.getUserByUsername = function(username, callback){
	User.findOne({user:username}, callback);
}