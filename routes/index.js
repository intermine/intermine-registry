var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/instance', function(req, res, next) {
    res.render('addInstance', { title: 'Express' });
});

function updateInstance(req, res, next){
  if (req.body.newOrganisms !== "") {
    var organisms = req.body.newOrganisms.split(",") ;
  }

  if (req.body.newNeighbours !== "") {
    var neighbours = req.body.newNeighbours.split(",");
  }

  var reqUrl = req.protocol + '://' + req.get('host') + "/registry/service/instances/" + req.body.updateId;
  request.put({
    body: {
      "name": req.body.newName,
      "url": req.body.newUrl,
      "description": req.body.newDesc,
      "twitter": req.body.newTwitter,
      "location": {
        "latitude": req.body.newLatitude,
        "longitude": req.body.newLongitude
      },
      "organisms": organisms,
      "neighbours": neighbours
    },
    url: reqUrl,
    json: true
  }, function (err, httpResponse, body){

    if (typeof body === "string"){
      body = JSON.parse(body);
    }

    if (body.statusCode != 201){
      res.render('addInstance', {
          name: req.body.newName,
          url: req.body.newUrl,
          desc: req.body.newDesc,
          twitter: req.body.newTwitter,
          lat: req.body.newLatitude,
          lon: req.body.newLongitude,
          organisms: req.body.newOrganisms,
          neighbours: req.body.newNeighbours,
          message: body.message
      });
    } else {
      res.redirect('/registry');
    }
  });

}

router.post('/instance', function(req, res, next) {

    if (req.body._method === "put"){
      updateInstance(req, res, next);
      return;
    }

    if (req.body.newOrganisms !== "") {
      var organisms = req.body.newOrganisms.split(",") ;
    }

    if (req.body.newNeighbours !== "") {
      var neighbours = req.body.newNeighbours.split(",");
    }

    var reqUrl = req.protocol + '://' + req.get('host') + "/registry/service/instances";
    request.post({
      body: {
        "name": req.body.newName,
        "url": req.body.newUrl,
        "description": req.body.newDesc,
        "twitter": req.body.newTwitter,
        "location": {
          "latitude": req.body.newLatitude,
          "longitude": req.body.newLongitude
        },
        "organisms": organisms,
        "neighbours": neighbours
      },
      url: reqUrl,
      json: true
    }, function (err, httpResponse, body){

      if (typeof body === "string"){
        body = JSON.parse(body);
      }

      if (body.statusCode != 201){
        res.render('addInstance', {
            name: req.body.newName,
            url: req.body.newUrl,
            desc: req.body.newDesc,
            twitter: req.body.newTwitter,
            lat: req.body.newLatitude,
            lon: req.body.newLongitude,
            organisms: req.body.newOrganisms,
            neighbours: req.body.newNeighbours,
            message: body.message
        });
      } else {
        res.redirect('/registry');
      }
    });

});

module.exports = router;
