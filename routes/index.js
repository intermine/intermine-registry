/**
 * Router for the InterMine Registry Front End endpoints.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
var passport = require('passport');
var Instance = require('../models/instance');

/**
 * Endpoint:  /login
 * Method:    GET
 * Description: Render the login view if the user is not logged in. Otherwise
 * redirect to home page.
 */
router.get('/login', function(req, res, next){
  if (req.query.success){
    res.render('login', { user: req.user, message: "Username or password are incorrect. Please, try again." });
  } else {
    if (typeof req.user === "undefined"){
      res.render('login', {user: req.user});
    } else {
      res.redirect('/');
    }
  }

});

/**
 * Endpoint:  /login
 * Method:    POST
 * Description: Authenticate user with passport. If failure, reload. If success,
 * redirect to home page.
 */
router.post('/login', passport.authenticate(
	'local', {
    successRedirect: '/',
    failureRedirect: '/login?success=0'
  })
);

/**
 * Endpoint:  /logout
 * Method:    GET
 * Description: Logout user. Redirect to home page.
 */
router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

/**
 * Endpoint:  /
 * Method:    GET
 * Description: Render home page, sending user as parameter.
 */
router.get('/', function(req, res, next) {
    if (typeof (req.query.success)){
      var operation = req.query.success;
      if (operation == 1){
        return res.render('index', { user: req.user, message: "Instance Added Successfully" });
      } else if (operation == 2) {
        return res.render('index', { user: req.user, message: "Instance Updated Successfuly" });
      }
    }
    return res.render('index', { user: req.user });
});

/**
 * Endpoint:  /instance
 * Method:    GET
 * Description: Render add instance page if user is logged in. Otherwhise,
 * redirect to unauthorized.
 */
router.get('/instance', function(req, res, next) {
    if (typeof req.user === "undefined"){
      res.render('403');
    } else {
      res.render('addInstance', {user: req.user});
    }
});

/**
 * Called from POST /instance. Does the Update instance procedure. Recieve
 * the same params that the POST /instance endpoint.
 */
function updateInstance(req, res, next){
  var organisms = [];
  var neighbours = [];

  // Get fields from form
  if (req.body.newOrganisms.trim() !== "") {
    organisms = req.body.newOrganisms.split(",") ;
  }

  if (req.body.newNeighbours.trim() !== "") {
    neighbours = req.body.newNeighbours.split(",");
  }

  var isProduction = true;
  if (req.body.newIsDev === "1"){
    var isProduction = false;
  }

  // Do a request to the API PUT endpoint, passing body and authentication
  var reqUrl = req.protocol + '://' + req.get('host') + "/service/instances/" + req.body.updateId;
  request.put({
    body: {
      "name": req.body.newName.trim(),
      "namespace": req.body.newNamespace.trim(),
      "url": req.body.newUrl.trim(),
      "description": req.body.newDesc,
      "maintainerOrgName": req.body.maintainerOrgName.trim(),
      "maintainerUrl": req.body.maintainerUrl.trim(),
      "maintainerEmail": req.body.maintainerEmail.trim(),
      "maintainerGithubUrl": req.body.maintainerGithubUrl.trim(),
      "twitter": req.body.newTwitter.trim(),
      "location": {
        "latitude": req.body.newLatitude,
        "longitude": req.body.newLongitude
      },
      "organisms": organisms,
      "neighbours": neighbours,
      "isProduction": isProduction
    },
    auth: {
      "user": req.user.user,
      "pass": req.user.password
    },
    url: reqUrl,
    json: true
  }, function (err, httpResponse, body){

    if (typeof body === "string"){
      body = JSON.parse(body);
    }

    // If not successful, render add Instance view with form filled and error message
    if (body.statusCode != 201){
      res.render('addInstance', {
          name: req.body.newName,
          namespace: req.body.newNamespace,
          url: req.body.newUrl,
          desc: req.body.newDesc,
          maintainerOrgName: req.body.maintainerOrgName,
          maintainerUrl: req.body.maintainerUrl,
          maintainerEmail: req.body.maintainerEmail,
          maintainerGithubUrl: req.body.maintainerGithubUrl,
          twitter: req.body.newTwitter,
          lat: req.body.newLatitude,
          lon: req.body.newLongitude,
          organisms: req.body.newOrganisms,
          neighbours: req.body.newNeighbours,
          message: body.friendlyMessage
      });
    } else {
      res.redirect('/?success=2');
    }
  });

}

/**
 * Endpoint:  /instance
 * Method:    POST
 * Description: Add or update and instance to the registry from front end.
 */
router.post('/instance', function(req, res, next) {

    // If method is PUT (update instance), call update function
    if (req.body._method === "put"){
      updateInstance(req, res, next);
      return;
    }

    // Get fields from form
    if (req.body.newOrganisms.trim() !== "") {
      var organisms = req.body.newOrganisms.split(",") ;
    }

    if (req.body.newNeighbours.trim() !== "") {
      var neighbours = req.body.newNeighbours.split(",");
    }

    var isProduction = true;
    if (req.body.newIsDev === "1"){
      var isProduction = false;
    }

    // Do a request to the API POST endpoint, passing body and authentication
    var reqUrl = req.protocol + '://' + req.get('host') + "/service/instances";
    request.post({
      body: {
        "name": req.body.newName.trim(),
        "namespace": req.body.newNamespace.trim(),
        "url": req.body.newUrl.trim(),
        "description": req.body.newDesc.trim(),
        "maintainerOrgName": req.body.maintainerOrgName.trim(),
        "maintainerUrl": req.body.maintainerUrl.trim(),
        "maintainerEmail": req.body.maintainerEmail.trim(),
        "maintainerGithubUrl": req.body.maintainerGithubUrl.trim(),
        "twitter": req.body.newTwitter.trim(),
        "location": {
          "latitude": req.body.newLatitude,
          "longitude": req.body.newLongitude
        },
        "organisms": organisms,
        "neighbours": neighbours,
        "isProduction": isProduction
      },
      auth: {
        "user": req.user.user,
        "pass": req.user.password
      },
      url: reqUrl,
      json: true
    }, function (err, httpResponse, body){

      if (typeof body === "string"){
        body = JSON.parse(body);
      }

      // If not sucessfull, render add Instance view with form filled and error message
      if (body.statusCode != 201){
        res.render('addInstance', {
            name: req.body.newName,
            namespace: req.body.newNamespace,
            url: req.body.newUrl,
            desc: req.body.newDesc,
            maintainerOrgName: req.body.maintainerOrgName,
            maintainerUrl: req.body.maintainerUrl,
            maintainerEmail: req.body.maintainerEmail,
            maintainerGithubUrl: req.body.maintainerGithubUrl,
            twitter: req.body.newTwitter,
            lat: req.body.newLatitude,
            lon: req.body.newLongitude,
            organisms: req.body.newOrganisms,
            neighbours: req.body.newNeighbours,
            message: body.friendlyMessage
        });
      } else {
        res.redirect('/?success=1');
      }
    });
});

/**
 * Endpoint:  /
 * Method:    GET
 * Description: Render home page, sending user as parameter.
 */
router.get('/im-to-galaxy', function(req, res, next) {
    galaxy = req.param('GALAXY_URL');
    if (typeof (req.query.success)){
      var operation = req.query.success;
      if (operation == 1){
        return res.render('index', { user: req.user, message: "Instance Added Successfully" });
      } else if (operation == 2) {
        return res.render('index', { user: req.user, message: "Instance Updated Successfuly" });
      }
    }
    return res.render('index', { user: req.user,  im2galaxy: true, galaxyUrl: galaxy});
});

router.get('/galaxy-to-im', function(req, res, next) {
    galaxy = req.param('URL')
    if (typeof (req.query.success)){
      var operation = req.query.success;
      if (operation == 1){
        return res.render('index', { user: req.user, message: "Instance Added Successfully" });
      } else if (operation == 2) {
        return res.render('index', { user: req.user, message: "Instance Updated Successfuly" });
      }
    }
    return res.render('index', { user: req.user, galaxy2im: true, galaxyUrl: galaxy});
});

router.get('/:namespace', function(req, res) {
    var namespace = req.params.namespace;
    if (namespace != "favicon.ico") {
        Instance.findOne({namespace : req.params.namespace}, function(err, instance){
            // Namespace not found
            if (instance == null){
                res.status(404).json({
                    statusCode: 404,
                    message: "Namespace Not Found",
                    executionTime: new Date().toLocaleString()
                });
                return;
            }
            res.redirect(303,instance.url);
            })
    }
});

router.get('/service/namespace', function(req, res) {
    var urlInput = req.query.url;
    if (!urlInput) {
        res.status(400).json({
                    statusCode: 400,
                    message: "Missing url parameter",
                    executionTime: new Date().toLocaleString()
                });
        return;
    }
    var prefix = new RegExp("(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?")
    urlInput = urlInput.replace(prefix, "");
    Instance.findOne({url : {$regex: urlInput, $options: 'i'}}, function(err, instance){
        if (instance == null){
            res.status(404).json({
                statusCode: 404,
                message: "Url Not Found",
                executionTime: new Date().toLocaleString()
            });
            return;
        }
        res.status(200).json({statusCode: 200, namespace: instance.namespace});
    })
});

module.exports = router;
