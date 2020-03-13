/**
 * Router for the InterMine Registry API Instances operations
 */
const express = require('express');
const request = require('request');
const async = require('async');
const passport = require('passport');
const router = express.Router();
const Instance = require('../models/instance');
const validate = require('express-jsonschema').validate;
const InstanceSchema = require('../models/instance_validate_schema').InstanceSchema;
const InstancePutSchema = require('../models/instance_validate_schema').InstancePutSchema;

/**
 * Endpoint:  /instances/
 * Method:    GET
 * Description: Get all the running instances from the registry. Accepts two optional
 * parameters.
 *  q: Query to search among instance organisms, name or description.
 *  mines: Query to get the dev/production or all instances.
 */
router.get('/', function(req, res, next) {
    let db_query = {};
    if (req.query.q){
        let query = req.query.q;
        db_query = {
            $or: [
                {organisms: { $in: [query] }},
                {$text: {$search: query}},
                {name: {$regex: query, $options: "i"}}
            ]
        }
    }

    if (req.query.mines){
        let productionParam = req.query.mines;
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
        let api_response = {};
        api_response.instances = instances
        api_response.statusCode = 200;
        api_response.executionTime = new Date().toLocaleString();
        res.status(api_response.statusCode).json(api_response);
    });
});

/**
 * Endpoint:  /instances/:instanceIdOrNameOrNamespace
 * Method:    GET
 * Description: Get all the information of the specified instance.
 */
router.get('/:id', function(req, res, next) {
    const toFind = req.params.id;

    const regex = new RegExp(["^", toFind, "$"].join(""), "i");
    // Exec query
    Instance.find({
        $or:[ { id: toFind}, { namespace: regex}, {name: regex } ]  // Case Insensitive
    }, function(err, instances){
        if (err){
            return res.send(err);
        }
        // Build the API Response
        let api_response = {};
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
        let api_response = {};
        api_response.statusCode = 200;
        n_removed = info['n'];
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

            let allIds = found.map(function(inst){ return parseInt(inst.id) });
            allIds.sort(function(a,b){
              return a-b;
            })
            newInstanceId = allIds[found.length-1] + 1;

            if (found.length == 0){
              newInstanceId = 1;
            }

            const regex = new RegExp("[a-z,\.\-]*");
            if(!regex.test(req.body.namespace)) {
                res.status(409).json({
                    statusCode: 409,
                    message: "Namespace wrong format",
                    friendlyMessage: "Namespace has wrong format",
                    executionTime: new Date().toLocaleString()
                });
                return;
            }

            // Test if name or namespace or URL provided are already in the registry
            let existingFields= getUniqueFields(found);
            let checkIfUnique = areAllFieldsUnique(req.body, existingFields);

            if(!checkIfUnique.isItUnique) {
              nonUniqueIdentifierError(checkIfUnique.areIndividualValuesUnique, res);
              //if things aren't unique don't proceed with the next bit
              //which would add the mine to the db!
              return;
            }

            // Build the new instance object
            let newInstanceObject = {
                id:                 newInstanceId.toString(),
                name:               req.body.name,
                namespace:          req.body.namespace,
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
            const intermine_endpoint = req.body.url + "/service/version/intermine";
            const release_endpoint = req.body.url + "/service/version/release";
            const api_endpoint = req.body.url + "/service/version";
            const branding_endpoint = req.body.url + "/service/branding";

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
                                  const JSONbody = JSON.parse(body);
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
                let newInstance = new Instance(newInstanceObject);

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

            // allow the namespace to be set if it has never been set before,
            // but do not allow it to be changed.
            if ((instance.namespace) && (instance.namespace.length > 0) && (instance.namespace !== req.body.namespace )){
                res.status(409).json({
                    statusCode: 409,
                    message: "Namespace can not be modified.",
                    executionTime: new Date().toLocaleString()
                });
                return;
            }

            // Test if name or namespace or URL provided are already in the registry
            let existingFields= getUniqueFields(found, req.params.id);
            let checkIfUnique = areAllFieldsUnique(req.body, existingFields);

            if(!checkIfUnique.isItUnique) {
              //TODO IF not isunique, tell which fields are not unique. Also duplicate this to two places please.
              nonUniqueIdentifierError(checkIfUnique.areIndividualValuesUnique, res);
              return;
            }

            // Check for present fields and consequently update them.
            instance.name = typeof(req.body.name) !== 'undefined' ? req.body.name : instance.name;
            //user must _never_ be allowed to update the namespace, unless it's
            //from null to some value - i.e. setting it for the first time while
            //updating the live registry
            if ((!instance.namespace) || (instance.namespace == "")) {
            instance.namespace = typeof(req.body.namespace) !== 'undefined' ? req.body.namespace : instance.namespace; 
            }
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

/**
Given a list of mines, return a list of mines without the mine id `mineId` present.
**/
const removeCurrentMine = function(mines, mineId) {
  return mines.filter(function(mine) {return (mine.id !== mineId)});
}

/**
Returns all values for field types that _must_ be unique in the registry.
foundMines: (required) list of InterMines as provided by the registry
mineToUpdate: (optional) if this is an update and not a new mine, tell us which
              mine is being updated
**/
function getUniqueFields(foundMines, mineToUpdate){

  // if we're updating the mine rather than adding it, don't check keep *this*
  // mine in the list of unique mines to check against or we'd never be able
  // to save the update mine since it will always match itself
  if (mineToUpdate) {
    foundMines = removeCurrentMine(foundMines, mineToUpdate);
  }

  //fetch a list of all the current values in the unique fields
  const allNames = foundMines.map(function(inst){  return inst.name.toLowerCase()  });
  const allNamespaces = foundMines.map(function(inst){
    // null check required to prevent errors in the UI
    // as we update the namespaces. This is only necessary because we're
    // updating the namespaces after the registry was created,
    // so they're all null values.
    let namespace;
    if(inst.namespace){
      namespace = inst.namespace.toLowerCase();
    }
    return namespace;
  });
  const allUrls = foundMines.map(function(inst){   return inst.url.toLowerCase() });

  return {
    urls : allUrls,
    names : allNames,
    namespaces : allNamespaces
  }
}

/**
Given a request to add or modify an instance, and the existing
mine fields, check the new request is unique for the name,
namespace, and url fields.
Returns the uniqueness states of each value and of the request as a whole
req: (required) the http request the server recieved for this addition/update
existingFields: (required) an object containing all the values for fields that
                must be unique.
**/
function areAllFieldsUnique(req, existingFields) {
  let newName = lowercaseIfExists(req.name),
      newURL = lowercaseIfExists(req.url),
      newNamespace = lowercaseIfExists(req.namespace),
      individualValues = {
        namespace : (existingFields.namespaces.indexOf(newNamespace) < 0),
        name : (existingFields.names.indexOf(newName) < 0),
        url : (existingFields.urls.indexOf(newURL) < 0 )
      };

      let areTheyAllUnique = true;

      //check all of the new fields against existing field values
      //and preserve which (if any) aren't unique, so we can give the
      //user a detailed error message.
      Object.keys(individualValues).map(function(key){
        let isThisValueUnique = individualValues[key];
         areTheyAllUnique = areTheyAllUnique && isThisValueUnique;
      });

  return {
    //is *everything* unique in this mine request?
    isItUnique : areTheyAllUnique,
    //which ones comply (or don't comply)
    areIndividualValuesUnique : individualValues
  };
}

/**
If we've decided a request isn't fully unique, throw an error
and tell the user *which* fields aren't unique so they know what to fix.
**/
function nonUniqueIdentifierError(namesOfFields, res) {
      let nonUniqueFields = []; Object.keys(namesOfFields).map(function(individualFieldName){
        if (!namesOfFields[individualFieldName]) {
        nonUniqueFields.push(individualFieldName);
      }
    });
    nonUniqueFields = nonUniqueFields.join(", ");
      res.status(409).json({
          statusCode: 409,
          message: "Instance is already in the Registry",
          friendlyMessage: nonUniqueFields + " is already in the Registry",
          executionTime: new Date().toLocaleString()
      });
      return;
}

/**
Don't try to lowercasify a property that doesn't exist, it'll cause the server to exit.
**/
function lowercaseIfExists(field) {
  let response;
  if (field) {
    response = field.toLowerCase();
  }
  return response;
}

module.exports = router;
