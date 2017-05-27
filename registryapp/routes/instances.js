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
        res.json(instances);
    });
});

module.exports = router;