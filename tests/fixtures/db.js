const User = require('../../models/user');
const Instance = require('../../models/instance');

// User credentials required for testing
const userOne = {
  user: 'testuser',
  password: 'asdfghj'
};

// Mine data to be stored in the database
const flyMine = {
  "name": "FlyMine",
  "namespace": "flymine",
  "neighbours": [
    "MODs"
  ],
  "organisms": [
    "Drosophila"
  ],
  "url": "http://www.flymine.org/query",
  "description": "FlyMine is an integrated database of genomic, expression and protein data for Drosophila, Anopheles and C. elegans",
  "location": {
    "latitude": "52.2003399",
    "longitude": "0.120109"
  },
  "twitter": "@intermineorg"
};

// Mine data to be stored in the database
const chickpeaMine = {
  "name": "ChickpeaMine",
  "namespace": "chickpeamine",
  "neighbours": [
    "Plants"
  ],
  "url": "http://mines.legumeinfo.org/chickpeamine",
  "organisms": [
    "A. ipaensis", "A. duranensis", "A. thaliana", "C. arietinum desi", "C. arietinum kabuli", "G. max", "M. truncatula", "P. vulgaris"
  ],
  "description": "A mine with chickpea data (both desi and kabuli varieties) from the Legume Information Systems (LIS) tripal.chado database",
  "location": {
    "latitude": "72.2003399",
    "longitude": "10.120109"
  },
  "twitter": "@LegumeFed"
};

// Updates to be apllied on FlyMine during testing
const flymineUpdate = {
  "neighbours": [
    "Plants"
  ],
  "namespace": "flymine"
};

// Update involving change of namespace
const changeNamespace = {
  "neighbours": [
    "Plants"
  ],
  "namespace": "flymine alpha"
};

// Run before tests
const setupDatabase = async () => {
  // Clear the test-database
  await Instance.deleteMany();
  await User.deleteMany();

  // Create a new user for testing
  await new User(userOne).save();
};

module.exports = {
  setupDatabase,
  userOne,
  flyMine,
  chickpeaMine,
  flymineUpdate,
  changeNamespace
};
