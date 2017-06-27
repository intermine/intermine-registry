var express = require('express');
var request = require('request');
var async = require('async');
var asyncLoop = require('node-async-loop');
var router = express.Router();
var Instance = require('../models/instance');

router.put('/:id', function(req, res, next){

    var toFind = req.params.id;
    Instance.findOne({
        $or:[ { id: toFind}, {name: {$regex: toFind, $options: "i"}} ]
    }, function(err, instance){
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

      async.parallel([
          function(callback){
              request.get(intermine_endpoint, function(err, response, body){
                  if (response.statusCode == 200){
                      instance.intermine_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }

                  callback(null, true);
              });
          },
          function(callback){
              request.get(release_endpoint, function(err, response, body){
                  if (response.statusCode == 200){
                      instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(api_endpoint, function(err, response, body){
                  if (response.statusCode == 200){
                      instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(branding_endpoint, function(err, response, body){
                  if (err){
                      res.send(err);
                  } else {
                      if (response.statusCode == 200){
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
              if (err){
                  res.send(err);
              }
              res.status(201).json({
                  instance_id: instance.id,
                  statusCode: 201,
                  message: "Instance " + instance.name +" Versions Updated",
                  executionTime: new Date().toLocaleString()
              });
          });
      });
    });
});

router.put('/', function(req, res, next){

    var toFind = req.params.id;
    Instance.find({}, function(err, instances){
      asyncLoop(instances, function(instance, next){
        var intermine_endpoint = instance.url + "/service/version/intermine";
        var release_endpoint = instance.url + "/service/version/release";
        var api_endpoint = instance.url + "/service/version";
        var branding_endpoint = instance.url + "/service/branding";

        async.parallel([
          function(callback){
              request.get(intermine_endpoint, function(err, response, body){
                  if (response.statusCode == 200){
                      instance.intermine_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }

                  callback(null, true);
              });
          },
          function(callback){
              request.get(release_endpoint, function(err, response, body){
                  if (response.statusCode == 200){
                      instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(api_endpoint, function(err, response, body){
                  if (response.statusCode == 200){
                      instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  }
                  callback(null, true);
              });
          },
          function(callback){
              request.get(branding_endpoint, function(err, response, body){
                  if (err){
                      res.send(err);
                  } else {
                      if (response.statusCode == 200){
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
                    res.send(err);
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
