var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/login', function(req, res, next){
    res.render('login', { user: req.user });
  });

router.post('/login', passport.authenticate(
	'local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/instance', function(req, res, next) {
    res.render('addInstance', { title: 'Express' });
});

function updateInstance(req, res, next){
  var organisms = [];
  var neighbours = [];
  if (req.body.newOrganisms !== "") {
    organisms = req.body.newOrganisms.split(",") ;
  }

  if (req.body.newNeighbours !== "") {
    neighbours = req.body.newNeighbours.split(",");
  }

  var reqUrl = req.protocol + '://' + req.get('host') + "/service/instances/" + req.body.updateId;
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
      res.redirect('/');
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

    var reqUrl = req.protocol + '://' + req.get('host') + "/service/instances";
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
        res.redirect('/');
      }
    });

});

module.exports = router;
