/**
 * Synchronize endpoint API router
 * NEEDS REAFACTORING
 */
var express = require('express');
var request = require('request');
var passport = require('passport');
var async = require('async');
var asyncLoop = require('node-async-loop');
var router = express.Router();
var Instance = require('../models/instance');

/**
 * Endpoint:  /synchronize/:id
 * Method:    PUT
 * Description:
 *
 */
router.put('/:id', passport.authenticate('basic', {session: false}), function(req, res, next){
    var toFind = req.params.id;
    // Query to find the instance
    Instance.findOne({
        $or:[ { id: toFind}, {name: {$regex: toFind, $options: "i"}} ]
    }, function(err, instance){
      // Instance not found
      if (instance == null){
          res.status(404).json({
              statusCode: 404,
              message: "Instance Not Found",
              executionTime: new Date().toLocaleString()
          });
          return;
      }
      var intermine_endpoint = instance.url + "/service/version/intermine";
      var release_endpoint = instance.url + "/service/version/release";
      var api_endpoint = instance.url + "/service/version";
      var branding_endpoint = instance.url + "/service/branding";

      // Four parallel calls to the endpoints previously instantiated
      async.parallel([
          function(callback){
              request.get(intermine_endpoint, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      // Sanitize response
                      instance.intermine_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                      instance.status = "Running";
                  } else {
                      // If the call for this endpoint does not work, status is changed to not running
                      instance.status = "Not Running";
                  }

                  callback(null, true);
              });
          },
          function(callback){
              request.get(release_endpoint, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(api_endpoint, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(branding_endpoint, function(err, response, body){
                  if (err){
                      return res.send(err);
                  } else {
                      if (typeof(response) != "undefined" && response.statusCode == 200){
                          try{
                              var JSONbody = JSON.parse(body);
                              instance.colors = JSONbody.properties.colors;
                              instance.images = JSONbody.properties.images;
                          }
                          catch (err){
                              console.log("Instance Branding Endpoint Not Found")
                              instance.colors = {};
                              instance.images = {};
                          }
                      }
                  }
                  callback(null, true);
              });
          }
      ], function (err, results){
          // If api_version is equal to another version, then the other version is left empty.
          instance.release_version = instance.api_version === instance.release_version ? "" : instance.release_version;
          instance.intermine_version = instance.api_version === instance.intermine_version ? "" : instance.intermine_version;
          instance.last_time_updated = new Date();
          // Save the synchronized instance on the registry
          instance.save(function(err){
              if (err){
                  return res.send(err);
              } else {
                  res.status(201).json({
                      instance_id: instance.id,
                      statusCode: 201,
                      message: "Instance " + instance.name +" Versions Updated",
                      executionTime: new Date().toLocaleString()
                  });
              }
          });
      });
    });
});

/**
 * Endpoint:  /synchronize
 * Method:    PUT
 * Description:
 *
 */
router.put('/', passport.authenticate('basic', {session: false}), function(req, res, next){
    Instance.find({}, function(err, instances){
      // For every instance on the registry, we do the synchronize procedure.
      asyncLoop(instances, function(instance, next){
        var intermine_endpoint = instance.url + "/service/version/intermine";
        var release_endpoint = instance.url + "/service/version/release";
        var api_endpoint = instance.url + "/service/version";
        var branding_endpoint = instance.url + "/service/branding";
        async.parallel([
          function(callback){
              request.get(intermine_endpoint, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      instance.intermine_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                      instance.status = "Running";
                  } else {
                      instance.status = "Not Running";
                  }

                  callback(null, true);
              });
          },
          function(callback){
              request.get(release_endpoint, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(api_endpoint, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(branding_endpoint, function(err, response, body){
                  if (err){
                      return res.send(err);
                  } else {
                      if (typeof(response) != "undefined" && response.statusCode == 200){
                          try{
                              var JSONbody = JSON.parse(body);
                              instance.colors = JSONbody.properties.colors;
                              instance.images = JSONbody.properties.images;
                          }
                          catch (err){
                              console.log("Instance Branding Endpoint Not Found")
                              instance.colors = {};
                              instance.images = {};
                          }
                      }
                  }
                  callback(null, true);
              });
            }
        ], function (err, results){
            instance.release_version = instance.api_version === instance.release_version ? "" : instance.release_version;
            instance.intermine_version = instance.api_version === instance.intermine_version ? "" : instance.intermine_version;
            instance.last_time_updated = new Date();
            instance.save(function(err){
                console.log("Instance " + instance.name +" Versions Updated")
                if (err){
                    return res.send(err);
                }
            });
            next();
        });
      }, function(err){
          res.status(201).json({
              statusCode: 201,
              message: "All Instances Successfully Updated",
              executionTime: new Date().toLocaleString()
          });
      });
  });
});


module.exports = router;
