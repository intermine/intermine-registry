/**
 * Created by Leonardo on 5/27/2017.
 */
var express = require('express');
var router = express.Router();
var Instance = require('../models/instance');
var validate = require('express-jsonschema').validate;
var InstanceSchema = require('../models/instance_validate_schema').InstanceSchema;
var InstancePutSchema = require('../models/instance_validate_schema').InstancePutSchema;

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

    Instance.find(db_query, function(err, instances){
        if (err){
            res.send(err);
        }
        var api_response = {};
        api_response['instances'] = instances
        api_response['statusCode'] = 200;
        if (instances.length === 0){
            api_response['statusCode'] = 404;
        }
        api_response['executionTime'] = new Date().toLocaleString();
        res.status(api_response['statusCode']).json(api_response);
    });
});

router.get('/:id', function(req, res, next) {
    var toFind = req.params.id;
    Instance.find({
        $or:[ { id: toFind}, {name: toFind} ]  // Is Case Sensitive
    },
    function(err, instances){
        if (err){
            res.send(err);
        }
        api_response = {};
        api_response['instance'] = instances[0];
        api_response['statusCode'] = 200;
        if (typeof instances[0] === 'undefined'){
            api_response['errorMsg'] = "Not Found"
            api_response['statusCode'] = 404;
        }
        api_response['executionTime'] = new Date().toLocaleString();
        res.status(api_response['statusCode']).json(api_response);
    });
});

router.delete('/:id', function(req, res, next){
    Instance.find({id: req.params.id}).remove(function(err, info){
        if (err){
            res.send(err);
        }
        var statusCode = 200;
        n_removed = info['result']['n'];
        var message = 'Instance Successfully Deleted';
        if (n_removed === 0){
            statusCode = 404;
            message = 'Instance Not Found';
        }
        res.status(statusCode).json({
            statusCode: statusCode,
            message: message,
            executionTime: new Date().toLocaleString()
        });
    });
});

router.post('/', validate({body: InstanceSchema}), function(req, res, next){

    // Check if the request is an 'application/json' type.
    if (req.get('Content-Type') !== 'application/json'){
        res.status(406).json({
            statusCode: 406,
            message: "Bad Request",
            executionTime: new Date().toLocaleString()
        });
        return;
    }

    newInstanceId = "";
    Instance.find().sort([['id', 'descending']]).exec(function(err, found){
        if (err){
            res.send(err);
        }
        newInstanceId = parseInt(found[0].id) + 1;

        var newInstanceObject = {
            id:                 newInstanceId.toString(),
            name:               req.body.name,
            neighbours:         req.body.neighbours,
            organisms:          req.body.organisms,
            twitter:            req.body.twitter,
            location:           req.body.location,
            url:                req.body.url,
            description:        req.body.description,
            created_at:         new Date(),
            last_time_updated:  new Date()
        };

        newInstanceObject.api_version =  typeof(req.body.api_version) !== 'undefined' ? req.body.api_version : "";
        newInstanceObject.web_version =  typeof(req.body.web_version) !== 'undefined' ? req.body.web_version : "";
        newInstanceObject.intermine_version =  typeof(req.body.intermine_version) !== 'undefined' ? req.body.intermine_version : "";
        newInstanceObject.colors =  typeof(req.body.colors) !== 'undefined' ? req.body.colors : "";
        newInstanceObject.images =  typeof(req.body.images) !== 'undefined' ? req.body.images : "";

        var newInstance = new Instance(newInstanceObject);

        newInstance.save(function(err){
            if (err){
                res.send(err);
            }
            res.status(201).json({
                instance_id: newInstanceId,
                statusCode: 201,
                message: "Instance Successfully Added to the Registry",
                executionTime: new Date().toLocaleString()
            });
        });
    });
});

router.put('/:id', validate({body: InstancePutSchema}), function(req, res, next){
    // Check if the request is an 'application/json' type.
    if (req.get('Content-Type') !== 'application/json'){
        res.status(406).json({
            statusCode: 406,
            message: "Bad Request",
            executionTime: new Date().toLocaleString()
        });
        return;
    }

    Instance.findOne({id : req.params.id}, function(err, instance){
        if (instance == null){
            res.status(404).json({
                statusCode: 404,
                message: "Instance Not Found",
                executionTime: new Date().toLocaleString()
            });
            return;
        }
        instance.name = typeof(req.body.name) !== 'undefined' ? req.body.name : instance.name;
        instance.neighbours = typeof(req.body.neighbours) !== 'undefined' ? req.body.neighbours : instance.neighbours;
        instance.organisms = typeof(req.body.organisms) !== 'undefined' ? req.body.organisms : instance.organisms;
        instance.twitter = typeof(req.body.twitter) !== 'undefined' ? req.body.twitter : instance.twitter;
        if (typeof(req.body.location) !== 'undefined'){
            instance.location.latitude = typeof(req.body.location.latitude) !== 'undefined' ? req.body.location.latitude : instance.location.latitude;
            instance.location.longitude = typeof(req.body.location.longitude) !== 'undefined' ? req.body.location.longitude : instance.location.longitude;
        }
        instance.url = typeof(req.body.url) !== 'undefined' ? req.body.url : instance.url;
        instance.description = typeof(req.body.description) !== 'undefined' ? req.body.description : instance.description;
        instance.last_time_updated = new Date();
        instance.api_version =  typeof(req.body.api_version) !== 'undefined' ? req.body.api_version : instance.api_version;
        instance.web_version =  typeof(req.body.web_version) !== 'undefined' ? req.body.web_version : instance.web_version;
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

        instance.save(function(err){
            if (err){
                res.send(err);
            }
            res.status(201).json({
                updated_instance_id: req.params.id,
                statusCode: 201,
                message: "Instance Successfully Updated",
                executionTime: new Date().toLocaleString()
            });
        });
    });
});

module.exports = router;
