/**
 * User Model
 */
var mongoose = require('mongoose');

// Schema Modeling
var Schema = mongoose.Schema;
var schema = new Schema({
    user: String,
    password: String
},
{
    collection: 'users'
});

var User = mongoose.model("User", schema);

module.exports = User;
