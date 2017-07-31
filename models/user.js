var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
    user: String,
    password: String
},
{
    collection: 'Users'
});

var User = mongoose.model("User", schema);

module.exports = User;
