/**
 * Created by Leonardo on 5/27/2017.
 */
var express = require('express');
var router = express.Router();
var Instance = require('../models/instance');
var validate = require('express-jsonschema').validate;
var InstanceSchema = require('../models/instance_validate_schema').InstanceSchema;

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
        api_response['executionTime'] = new Date().toLocaleString();
        res.json(api_response);
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
        res.json(api_response);
    });
});

router.delete('/:id', function(req, res, next){
    Instance.find({id: req.params.id}).remove(function(err, info){
        if (err){
            res.send(err);
        }
        n_removed = info['result']['n'];
        var message = 'Instance Successfully Deleted';
        if (n_removed === 0){
            message = 'Instance Not Found';
        }
        res.json({
            statusCode: 200,
            message: message,
            executionTime: new Date().toLocaleString()
        });
    });
});

router.post('/', validate({body: InstanceSchema}), function(req, res, next){

    // Check if the request is an 'application/json' type.
    if (req.get('Content-Type') !== 'application/json'){
        res.json({
            statusCode: 200,
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
        newInstanceId = found[0].id.toString() + 1;
    });

    console.log(req.body);

    var newInstanceObject = {
        id:                 newInstanceId,
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
        res.json({
            instance_id: newInstanceId,
            statusCode: 201,
            message: "Instance Successfully Added",
            executionTime: new Date().toLocaleString()
        });
    });
});

router.put('/', function(req, res, next){
  if (req.get('Content-Type') !== 'application/json'){
      res.json({
          statusCode: 200,
          message: "Bad Request",
          executionTime: new Date().toLocaleString()
      });
      return;
  }
});

module.exports = router;
