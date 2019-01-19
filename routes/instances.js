/**
 * Router for the InterMine Registry API Instances operations
 */
var express = require('express');
var request = require('request');
var async = require('async');
var passport = require('passport');
var router = express.Router();
var Instance = require('../models/instance');
var validate = require('express-jsonschema').validate;
var InstanceSchema = require('../models/instance_validate_schema').InstanceSchema;
var InstancePutSchema = require('../models/instance_validate_schema').InstancePutSchema;

/**
 * Endpoint:  /instances/
 * Method:    GET
 * Description: Get all the running instances from the registry. Accepts two optional
 * parameters.
 *  q: Query to search among instance organisms, name or description.
 *  mines: Query to get the dev/production or all instances.
 */
router.get('/', function(req, res, next) {
    var db_query = {};
    if (req.query.q){
        var query = req.query.q;
        db_query = {
            $or: [
                {organisms: { $in: [query] }},
                {$text: {$search: query}},
                {name: {$regex: query, $options: "i"}}
            ]
        }
    }

    if (req.query.mines){
        var productionParam = req.query.mines;
        if (productionParam === "dev"){
            db_query.isProduction = false;
        } else if (productionParam === "prod") {
            db_query.isProduction = true;
        }
    } else {
        db_query.isProduction = true;
    }

    // Just get the instances that are running
    db_query.status = "Running";

    // Exec query
    Instance.find(db_query).sort({name: 1}).exec(function(err, instances){
        if (err){
            return res.send(err);
        }
        // Build the API response
        var api_response = {};
        api_response.instances = instances
        api_response.statusCode = 200;
        api_response.executionTime = new Date().toLocaleString();
        res.status(api_response.statusCode).json(api_response);
    });
});

/**
 * Endpoint:  /instances/:instanceIdOrName
 * Method:    GET
 * Description: Get all the information of the specified instance.
 */
router.get('/:id', function(req, res, next) {
    var toFind = req.params.id;

    var regex = new RegExp(["^", toFind, "$"].join(""), "i");
    // Exec query
    Instance.find({
        $or:[ { id: toFind}, {name: regex } ]  // Case Insensitive
    }, function(err, instances){
        if (err){
            return res.send(err);
        }
        // Build the API Response
        var api_response = {};
        api_response.instance = instances[0];
        api_response.statusCode = 200;
        if (typeof instances[0] === 'undefined'){
            api_response.errorMsg = "Not Found"
            api_response.statusCode = 404;
        }
        api_response.executionTime = new Date().toLocaleString();
        res.status(api_response.statusCode).json(api_response);
    });
});

/**
 * Endpoint:  /instances/:instanceId
 * Method:    DELETE
 * Description: Delete the instance given in the URL from the Registry.
 * Authentication is required everytime the endpoint is called.
 */
router.delete('/:id', passport.authenticate('basic', {session: false}), function(req, res, next){
    // Exec Query
    Instance.find({id: req.params.id}).remove(function(err, info){
        if (err){
            return res.send(err);
        }
        // Build the API Response
        var api_response = {};
        api_response.statusCode = 200;
        n_removed = info['result']['n'];
        api_response.message = 'Instance Successfully Deleted';
        if (n_removed === 0){
            api_response.statusCode = 404;
            api_response.message = 'Instance Not Found';
        }
        api_response.executionTime = new Date().toLocaleString();
        res.status(api_response.statusCode).json(api_response);
    });
});

/**
 * Endpoint:  /instances/
 * Method:    POST
 * Description: Add a new instance to the InterMine Registry. Name and URL are
 * required. Provided URL is subject to test by doing a ping to the mine
 * /version endpoint.
 * Authentication is required everytime the endpoint is called.
 */
router.post('/', passport.authenticate('basic', {session: false}), validate({body: InstanceSchema}), function(req, res, next){
    // Check if the request is an 'application/json' type.
    if (req.get('Content-Type') !== 'application/json'){
        res.status(406).json({
            statusCode: 406,
            message: "Bad Request",
            friendlyMessage: "Request is not application/json type.",
            executionTime: new Date().toLocaleString()
        });
        return;
    }

    request.get(req.body.url+"/service/version/", function(err, response, body){
        // Test URL
        if (typeof(response) === 'undefined' || response.statusCode != "200"){
            res.status(400).json({
                statusCode: 400,
                message: "Bad Request. Instance URL is not working.",
                friendlyMessage: "The provided URL is not working or is not an Intermine Instance URL.",
                executionTime: new Date().toLocaleString()
            });
            return;
        }

        newInstanceId = "";
        // Get new instance ID
        Instance.find().exec(function(err, found){
            if (err){
                return res.send(err);
            }

            var allIds = found.map(function(inst){ return parseInt(inst.id) });
            allIds.sort(function(a,b){
              return a-b;
            })
            newInstanceId = allIds[found.length-1] + 1;

            if (found.length == 0){
              newInstanceId = 1;
            }

            // Test if name or URL provided is already in the registry
            var allNames = found.map(function(inst){  return inst.name.toLowerCase()  });
            var allUrls = found.map(function(inst){   return inst.url.toLowerCase() });

            if (allNames.indexOf(req.body.name.toLowerCase()) >= 0 || allUrls.indexOf(req.body.url.toLowerCase()) >=0) {
                res.status(409).json({
                    statusCode: 409,
                    message: "Instance is already in the Registry",
                    friendlyMessage: "Instance name or URL is already in the Registry",
                    executionTime: new Date().toLocaleString()
                });
                return;
            }

            // Build the new instance object
            var newInstanceObject = {
                id:                 newInstanceId.toString(),
                name:               req.body.name,
                neighbours:         req.body.neighbours,
                organisms:          req.body.organisms,
                url:                req.body.url,
                created_at:         new Date(),
                last_time_updated:  new Date()
            };

            newInstanceObject.status = "Running";

            // Check for instance additional fields existance
            newInstanceObject.isProduction = typeof(req.body.isProduction) !== 'undefined' ? req.body.isProduction : true;
            newInstanceObject.twitter = typeof(req.body.twitter) !== 'undefined' ? req.body.twitter : "";
            newInstanceObject.description = typeof(req.body.description) !== 'undefined' ? req.body.description : "";
            newInstanceObject.location = typeof(req.body.location) !== 'undefined' ? req.body.location : {"latitude": "", "longitude": ""};
            newInstanceObject.maintainerOrgName = typeof(req.body.maintainerOrgName) !== 'undefined' ? req.body.maintainerOrgName : "";
            newInstanceObject.maintainerUrl = typeof(req.body.maintainerUrl) !== 'undefined' ? req.body.maintainerUrl : "";
            newInstanceObject.maintainerEmail = typeof(req.body.maintainerEmail) !== 'undefined' ? req.body.maintainerEmail : "";
            newInstanceObject.maintainerGithubUrl = typeof(req.body.maintainerGithubUrl) !== 'undefined' ? req.body.maintainerGithubUrl : "";

            // Get the instance Versions & Branding information
            var intermine_endpoint = req.body.url + "/service/version/intermine";
            var release_endpoint = req.body.url + "/service/version/release";
            var api_endpoint = req.body.url + "/service/version";
            var branding_endpoint = req.body.url + "/service/branding";

            // We do 4 async parallel calls for fetching information
            async.parallel([
                function(callback){
                    request.get(intermine_endpoint, function(err, response, body){
                        if (response.statusCode == 200){
                            newInstanceObject.intermine_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                        } else {
                            newInstanceObject.intermine_version = "";
                        }
                        callback(null, true);
                    });
                },
                function(callback){
                    request.get(release_endpoint, function(err, response, body){
                        if (response.statusCode == 200){
                            newInstanceObject.release_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                        } else {
                            newInstanceObject.release_version = "";
                        }

                        callback(null, true);
                    });
                },
                function(callback){
                    request.get(api_endpoint, function(err, response, body){
                        if (response.statusCode == 200){
                            newInstanceObject.api_version =  body.replace(/[`'"<>\{\}\[\]\\\/]/gi, '').trim();
                        } else {
                            newInstanceObject.api_version = "";
                        }
                        callback(null, true);
                    });
                },
                function(callback){
                    request.get(branding_endpoint, function(err, response, body){
                        if (err){
                            return res.send(err);
                        } else {
                          if (response.statusCode == 200 ){
                              try{
                                  var JSONbody = JSON.parse(body);
                                  newInstanceObject.colors = JSONbody.properties.colors;
                                  newInstanceObject.images = JSONbody.properties.images;
                              }
                              catch (err){
                                  console.log("Instance Branding Endpoint Not Found")
                                  newInstanceObject.colors = {};
                                  newInstanceObject.images = {};
                              }
                          } else {
                              newInstanceObject.colors = {};
                              newInstanceObject.images = {};
                          }


                        }
                        callback(null, true);
                    });
                }
            ], function (err, results){
                // Check for other endpoints correct existance
                newInstanceObject.release_version = newInstanceObject.api_version === newInstanceObject.release_version ? "" : newInstanceObject.release_version;
                newInstanceObject.intermine_version = newInstanceObject.api_version === newInstanceObject.intermine_version ? "" : newInstanceObject.intermine_version;

                // Create Instance
                var newInstance = new Instance(newInstanceObject);

                // Save instance on the Registry
                newInstance.save(function(err){
                    if (err){
                        return res.send(err);
                    }
                    res.status(201).json({
                        instance_id: newInstanceId,
                        statusCode: 201,
                        message: "Instance Successfully Added to the Registry",
                        friendlyMessage: "Instance Successfully Added to the Registry",
                        executionTime: new Date().toLocaleString()
                    });
                });
            });
        });
    });
});

/**
 * Endpoint:  /instances/:id
 * Method:    PUT
 * Description: Update the instance given in the URL on the Registry. Provided
 * URL is subject to test by doing a ping to the mine version endpoint.
 * Authentication is required everytime the endpoint is called.
 */
router.put('/:id', passport.authenticate('basic', {session: false}), validate({body: InstancePutSchema}), function(req, res, next){
    // Check if the request is an 'application/json' type.
    if (req.get('Content-Type') !== 'application/json'){
        res.status(406).json({
            statusCode: 406,
            message: "Bad Request",
            friendlyMessage: "Request is not application/json type",
            executionTime: new Date().toLocaleString()
        });
        return;
    }

    // Find the instance to update
    Instance.findOne({id : req.params.id}, function(err, instance){
        // Instance not found
        if (instance == null){
            res.status(404).json({
                statusCode: 404,
                message: "Instance Not Found",
                executionTime: new Date().toLocaleString()
            });
            return;
        }

        Instance.find().exec(function(err, found){
            if (err){
                return res.send(err);
            }
            // Test if name or URL provided is already in the registry
            var allNames = found.map(function(inst){  return inst.name.toLowerCase()  });
            var allUrls = found.map(function(inst){   return inst.url.toLowerCase() });

            if ((allNames.indexOf(req.body.name.toLowerCase()) >= 0 && found[allNames.indexOf(req.body.name.toLowerCase())].id !== req.params.id)
            || (allUrls.indexOf(req.body.url.toLowerCase()) >=0 && found[allUrls.indexOf(req.body.url.toLowerCase())].id !== req.params.id)) {
                res.status(409).json({
                    statusCode: 409,
                    message: "Instance is already in the Registry",
                    friendlyMessage: "Instance name or URL is already in the Registry",
                    executionTime: new Date().toLocaleString()
                });
                return;
            }
            // Check for present fields and consequently update them.
            instance.name = typeof(req.body.name) !== 'undefined' ? req.body.name : instance.name;
            instance.neighbours = typeof(req.body.neighbours) !== 'undefined' ? req.body.neighbours : instance.neighbours;
            instance.organisms = typeof(req.body.organisms) !== 'undefined' ? req.body.organisms : instance.organisms;
            instance.isProduction = typeof(req.body.isProduction) !== 'undefined' ? req.body.isProduction : instance.isProduction;
            instance.twitter = typeof(req.body.twitter) !== 'undefined' ? req.body.twitter : instance.twitter;
            if (typeof(req.body.location) !== 'undefined'){
                instance.location.latitude = typeof(req.body.location.latitude) !== 'undefined' ? req.body.location.latitude : instance.location.latitude;
                instance.location.longitude = typeof(req.body.location.longitude) !== 'undefined' ? req.body.location.longitude : instance.location.longitude;
            }

            instance.description = typeof(req.body.description) !== 'undefined' ? req.body.description : instance.description;
            instance.maintainerOrgName = typeof(req.body.maintainerOrgName) !== 'undefined' ? req.body.maintainerOrgName : instance.maintainerOrgName;
            instance.maintainerUrl = typeof(req.body.maintainerUrl) !== 'undefined' ? req.body.maintainerUrl : instance.maintainerUrl;
            instance.maintainerEmail = typeof(req.body.maintainerEmail) !== 'undefined' ? req.body.maintainerEmail : instance.maintainerEmail;
            instance.maintainerGithubUrl = typeof(req.body.maintainerGithubUrl) !== 'undefined' ? req.body.maintainerGithubUrl : instance.maintainerGithubUrl;
            instance.last_time_updated = new Date();
            instance.api_version =  typeof(req.body.api_version) !== 'undefined' ? req.body.api_version : instance.api_version;
            instance.release_version =  typeof(req.body.release_version) !== 'undefined' ? req.body.release_version : instance.release_version;
            instance.intermine_version =  typeof(req.body.intermine_version) !== 'undefined' ? req.body.intermine_version : instance.intermine_version;
            if (typeof(req.body.colors) !== 'undefined'){
                if (typeof(req.body.colors.focus) !== 'undefined'){
                    instance.colors.focus.fg =  typeof(req.body.colors.focus.fg) !== 'undefined' ? req.body.colors.focus.fg : instance.colors.focus.fg;
                    instance.colors.focus.bg =  typeof(req.body.colors.focus.bg) !== 'undefined' ? req.body.colors.focus.bg : instance.colors.focus.bg;
                }
            }
            if (typeof(req.body.colors) !== 'undefined'){
                if (typeof(req.body.colors.main) !== 'undefined'){
                    instance.colors.main.fg =  typeof(req.body.colors.main.fg) !== 'undefined' ? req.body.colors.main.fg : instance.colors.main.fg;
                    instance.colors.main.bg =  typeof(req.body.colors.main.bg) !== 'undefined' ? req.body.colors.main.bg : instance.colors.main.bg;
                }
            }
            if (typeof(req.body.images) !== 'undefined'){
                instance.images.small =  typeof(req.body.images.small) !== 'undefined' ? req.body.images.small : instance.images.small;
                instance.images.main =  typeof(req.body.images.main) !== 'undefined' ? req.body.images.main : instance.images.main;
            }

            // Test URL if present. If not, save updated instance on registry.
            if (typeof(req.body.url) !== 'undefined'){
                request.get(req.body.url+"/service/version/", function(err, response, body){
                    if (typeof(response) === 'undefined' || response.statusCode != "200"){
                        res.status(400).json({
                            statusCode: 400,
                            message: "Bad Request. Instance URL is not working.",
                            friendlyMessage: "Provided URL is not working.",
                            executionTime: new Date().toLocaleString()
                        });
                        return;
                    }
                    instance.url = req.body.url;

                    // Save updated instance
                    instance.save(function(err){
                        if (err){
                            return res.send(err);
                        }
                        res.status(201).json({
                            updated_instance_id: req.params.id,
                            statusCode: 201,
                            message: "Instance Successfully Updated",
                            friendlyMessage: "Instance Successfully Updated",
                            executionTime: new Date().toLocaleString()
                        });
                    });
                });
            } else {
              instance.save(function(err){
                  if (err){
                      return res.send(err);
                  }
                  // Save updated instance
                  res.status(201).json({
                      updated_instance_id: req.params.id,
                      statusCode: 201,
                      message: "Instance Successfully Updated",
                      friendlyMessage: "Instance Successfully Updated",
                      executionTime: new Date().toLocaleString()
                  });
              });
            }
        });
    });
});

module.exports = router;
