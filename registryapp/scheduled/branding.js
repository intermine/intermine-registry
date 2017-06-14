var cron = require('node-cron');
var request = require('request');
var asyncLoop = require('node-async-loop');
var Instance = require('../models/instance');
// Every 24 hours: 0 0 * * *
// Using every 10 seconds for testing purposes

cron.schedule('0 0 * * *', function(){
  // Get all instances from DB
  Instance.find({}, function(err, instances){
      if (err){
          res.send(err);
      }
      // Iter every instance
      asyncLoop(instances, function(instance, next){
          var instanceUrl = instance.url;
          var branding_endpoint = instanceUrl + "/service/branding";
          request.get(branding_endpoint, function(err, response, body){
              if (err){
                  console.log('Error Updating Branding of: ' + instance.name);
              } else {
                var JSONbody = JSON.parse(body);
                instance.colors = JSONbody.properties.colors;
                instance.images = JSONbody.properties.images;
                instance.last_time_updated = new Date();
                instance.save(function(err){
                    if (err){
                        res.send(err);
                    } else {
                        console.log("Instance " + instance.name +" Branding Updated");
                    }
                });

              }
              next();
          });
      });
  });
});
