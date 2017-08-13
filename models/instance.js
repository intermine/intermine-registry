/**
 * Instance Model.
 */
// Registry Connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://lkuffo2:sandbox1@ds115712.mlab.com:15712/intermineregistry';
var DB_USER = process.env.DB_USER;
var DB_PASS = process.env.DB_PASS;
//var mongoDB = 'mongodb://'+ DB_USER + ':' + DB_PASS + '@ds115712.mlab.com:15712/intermineregistry';
mongoose.connect(mongoDB);
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
    twitter:            String,
    status: String,
    isProduction: Boolean
},
    {
        collection: 'instances'
    }
);

// Create Text index on description field
schema.index({description: "text"});

var Instance = mongoose.model("instance", schema);
module.exports = Instance;
