var cron = require('node-cron');
var async = require('async');
var request = require('request');
var Instance = require('../models/instance');
// Every 24 hours: 0 0 * * *

var toUpdate = ["api_version",
                "release_version",
                "intermine_version"]

cron.schedule('*/10 * * * * *', function(){
  // Get all instances from DB
  Instance.find({}, function(err, instances){
      if (err){
          res.send(err);
      }
      // Iter every instance
      for (i=0; i < instances.length; i++){
          var instance = instances[i]
          var instanceUrl = instance.url;
          var instanceId = instance.id;
          var instanceName = instance.name;
          var intermine_endpoint = instanceUrl + "/service/version/intermine";
          var release_endpoint = instanceUrl + "/service/version/release";
          var api_endpoint = instanceUrl + "/service/version";
          async.parallel([
              function(callback){
                  request.get(intermine_endpoint, function(err, response, body){
                      instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                      callback(null, true);
                  });
              },
              function(callback){
                  request.get(release_endpoint, function(err, response, body){
                      instance.intermine_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                      callback(null, true);
                  });
              },
              function(callback){
                  request.get(api_endpoint, function(err, response, body){
                      instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                      callback(null, true);
                  });
              }
          ], function (err, results){
              // After all updates have been done. Save Instance
              instance.save(function(err){
                  if (err){
                      res.send(err);
                  } else {
                      console.log("Instance" + instanceName + " Successfully Updated");
                  }
              })
          });
      }
  });
});
