var express = require('express');
var request = require('request');
var async = require('async');
var router = express.Router();
var Instance = require('../models/instance');
var validate = require('express-jsonschema').validate;
var InstanceSchema = require('../models/instance_validate_schema').InstanceSchema;
var InstancePutSchema = require('../models/instance_validate_schema').InstancePutSchema;

router.put('/:id', validate({body: InstancePutSchema}), function(req, res, next){

    var toFind = req.params.id;
    Instance.findOne({
        $or:[ { id: toFind}, {name: {$regex: toFind, $options: "i"}} ]  // Case Insensitive
    }, function(err, instance){
      var intermine_endpoint = instance.url + "/service/version/intermine";
      var release_endpoint = instance.url + "/service/version/release";
      var api_endpoint = instance.url + "/service/version";
      var branding_endpoint = instance.url + "/service/branding";

      async.parallel([
          function(callback){
              request.get(intermine_endpoint, function(err, response, body){
                  instance.intermine_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  callback(null, true);
              });
          },
          function(callback){
              request.get(release_endpoint, function(err, response, body){
                  instance.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  callback(null, true);
              });
          },
          function(callback){
              request.get(api_endpoint, function(err, response, body){
                  instance.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                  callback(null, true);
              });
          },
          function(callback){
              request.get(branding_endpoint, function(err, response, body){
                  if (err){
                      res.send(err);
                  } else {
                    var JSONbody = JSON.parse(body);
                    instance.colors = JSONbody.properties.colors;
                    instance.images = JSONbody.properties.images;
                  }
                  callback(null, true);
              });
          }
      ], function (err, results){
          instance.release_version = instance.api_version === instance.release_version ? "" : instance.release_version;
          instance.intermine_version = instance.api_version === instance.intermine_version ? "" : instance.intermine_version;

          instance.save(function(err){
              if (err){
                  res.send(err);
              }
              res.status(201).json({
                  instance_id: newInstanceId,
                  statusCode: 201,
                  message: "Instance Successfully Updated",
                  executionTime: new Date().toLocaleString()
              });
          });
      });
    });
});

module.exports = router;
