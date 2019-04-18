const User = require('./models/user');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const print_error = '\x1b[31m%s\x1b[0m'; // prints string injected in red
const print_success = '\x1b[32m%s\x1b[0m'; // prints string injected in green

function getInfoAndCreate() {
  rl.question('Please enter the username : ', (username) => {
    rl.question('Please enter the password : ', (password) => {
          const newUser = User({
            user : username,
            password : password
          });

          User.createUser(newUser, function(error){
            if (error) {
              switch (error.code) {
                case 11000: {
                  console.log(print_error, 'User with provided name already exists! Try again with different name!');
                  getInfoAndCreate();
                  return;
                }
                default: {
                  throw error;
                }
              }
            } else {
              console.log(print_success, "User with username " + newUser.user + " created.");
              rl.close(process.exit(1));
            }
          });
      });
  });
}

getInfoAndCreate();
