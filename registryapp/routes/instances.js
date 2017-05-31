/**
 * Created by Leonardo on 5/27/2017.
 */
var express = require('express');
var router = express.Router();
var Instance = require('../models/instance');

router.get('/', function(req, res, next) {
    Instance.find(function(err, instances){
        if (err){
            res.send(err);
        }
        var api_response = {};
        if (req.query.q){
            var filtered_instances = [];
            var query = req.query.q.toLowerCase();
            for (var i in instances){
                var instance = instances[i];
                //Use Query for This
                if (instance['description'].toLowerCase().indexOf(query) !== -1 || instance['organisms'].includes(query) || instance['name'].toLowerCase().indexOf(query) !== -1){
                    filtered_instances.push(instance);
                }
            }
            api_response['instances'] = filtered_instances
        }else{
            api_response['instances'] = instances;
        }
        api_response['statusCode'] = 200;
        api_response['executionTime'] = new Date().toLocaleString();
        res.json(api_response);
    });
});

router.get('/:id', function(req, res, next) {
    var toFind = req.params.id;
    Instance.find({
        id: toFind
    },
    function(err, instances){
        if (err){
            res.send(err);
        }
        api_response = {};
        api_response['instance'] = instances[0];
        api_response['statusCode'] = 200;
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

router.post('/', function(req, res, next){
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

    var newInstance = new Instance({
        id:                 newInstanceId,
        name:               req.body.name,
        api_version:        req.body.api_version,
        web_version:        req.body.web_version,
        mine_version:       req.body.mine_version,
        created_at:         new Date(),
        last_time_updated:  new Date(),
        neighbours:         req.body.neighbours,
        organisms:          req.body.organisms,
        url:                req.body.url,
        description:        req.body.description,
        location:           req.body.location,
        twitter:            req.body.twitter
    });

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

module.exports = router;
