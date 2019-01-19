/**
 * Instance Model.
 */
// Registry Connection
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Schema Modeling
var Schema = mongoose.Schema;

var schema = new Schema({
    id:                 String,
    name:               {type: String, index:  true},
    api_version:        String,
    release_version:        String,
    intermine_version:       String,
    created_at:         Date,
    last_time_updated:  Date,
    neighbours:         [String],
    organisms:          {type: [String], index: true},
    url:                String,
    description:        String,
    location:           {
        latitude:   String,
        longitude:  String
    },
    colors: {
        focus: {
            fg: String,
            bg: String,
        },
        main: {
            fg: String,
            bg: String
        },
        header: {
            text: String,
            main: String
        }
    },
    images: {
        small: String,
        main:  String,
        logo: String
    },
    twitter: String,
    status: String,
    isProduction: Boolean,
    maintainerOrgName: String,
    maintainerUrl: String,
    maintainerEmail: String,
    maintainerGithubUrl: String
},
    {
        collection: 'instances'
    }
);

// Create Text index on description field
schema.index({description: "text"});

var Instance = mongoose.model("instance", schema);
module.exports = Instance;
