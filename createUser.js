var User = require('./models/user');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please enter the username : ', (username) => {
	rl.question('Please enter the password : ', (password) => {
        var newUser = User({
        	user : username,
        	password : password
        });
        
        User.createUser(newUser, function(error){
        	if(error)
        		throw error;
        	else
        		console.log("User with username " + newUser.user + " created..");
        	rl.close(process.exit(1));
        });
    });
});