/**
 * Router for the InterMine Registry API Synchronize operations.
 */
const express = require('express');
const request = require('request');
const passport = require('passport');
const async = require('async');
const asyncLoop = require('node-async-loop');
const router = express.Router();
const Instance = require('../models/instance');

/**
 * Endpoint:  /synchronize/:id
 * Method:    PUT
 * Description: Update the branding & version information of the instance given
 * in the URL.
 */
router.put('/:id', passport.authenticate('basic', {session: false}), function(req, res, next){
    const toFind = req.params.id;
    // Find the instance to update
    const regex = new RegExp(["^", toFind, "$"].join(""), "i");
    Instance.findOne({
        $or:[ { id: toFind}, {name: regex} ]
    }, function(err, instance){
      // Instance not found
      if (instance == null){
          res.status(404).json({
              statusCode: 404,
              message: "Instance Not Found",
              friendlyMessage: "Instance Not Found",
              executionTime: new Date().toLocaleString()
          });
          return;
      }

      let intermine_endpoint = instance.url + "/service/version/intermine";
      let release_endpoint = instance.url + "/service/version/release";
      let api_endpoint = instance.url + "/service/version";
      let branding_endpoint = instance.url + "/service/branding";

      // We do 4 async parallel calls for fetching information
      async.parallel([
          function(callback){
              request.get(intermine_endpoint, {timeout: 3000}, function(err, response, body){
                  if (err && (err.code == 'ETIMEDOUT' || ERR.CONNECT === true)){
                    console.log("Timeout error fetching " + instance.name);
                    instance.status = "Not Running";
                  }
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
              request.get(release_endpoint, {timeout: 3000}, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      // Sanitize response
                      instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(api_endpoint, {timeout: 3000}, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      // Sanitize response
                      instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(branding_endpoint, {timeout: 3000}, function(err, response, body){
                  if (err){
                      return res.send(err);
                  } else {
                      if (typeof(response) != "undefined" && response.statusCode == 200){
                          try{
                              const JSONbody = JSON.parse(body);
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
          // Check for other endpoints correct existance
          instance.release_version = instance.api_version === instance.release_version ? "" : instance.release_version;
          instance.intermine_version = instance.api_version === instance.intermine_version ? "" : instance.intermine_version;
          instance.last_time_updated = new Date();

          // Save instance on the Registry
          instance.save(function(err){
              if (err){
                  return res.send(err);
              } else {
                  res.status(201).json({
                      instance_id: instance.id,
                      statusCode: 201,
                      message: "Instance " + instance.name +" Versions Updated",
                      friendlyMessage: "Instance " + instance.name +" Versions Updated",
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
 * Description: Update the branding & version information of every instance on
 * the InterMine Registry. For each instance on the registry we do 4 parallel
 * http requests to the branding & version endpoints to verify if they are
 * updated.
 */
router.put('/', passport.authenticate('basic', {session: false}), function(req, res, next){
    Instance.find({}, function(err, instances){
      // For every instance on the registry, we do the synchronize procedure.
      asyncLoop(instances, function(instance, next){
        let intermine_endpoint = instance.url + "/service/version/intermine";
        let release_endpoint = instance.url + "/service/version/release";
        let api_endpoint = instance.url + "/service/version";
        let branding_endpoint = instance.url + "/service/branding";
        async.parallel([
          function(callback){
              request.get(intermine_endpoint, {timeout: 5000}, function(err, response, body){
                  if (err && (err.code == 'ETIMEDOUT' || ERR.CONNECT === true)){
                    console.log("Timeout error fetching " + instance.name);
                    instance.status = "Not Running";
                  }
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
              request.get(release_endpoint, {timeout: 2000}, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(api_endpoint, {timeout: 2000}, function(err, response, body){
                  if (typeof(response) != "undefined" && response.statusCode == 200){
                      instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(branding_endpoint, {timeout: 2000}, function(err, response, body){
                  if (err){
                      return res.send(err);
                  } else {
                      if (typeof(response) != "undefined" && response.statusCode == 200){
                          try{
                              const JSONbody = JSON.parse(body);
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
