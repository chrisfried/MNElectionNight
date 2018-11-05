var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');

router.get('/', function(req, res) {
  res.render('index');
});

// Courtesy of https://github.com/DestinyTrialsReport/DestinyTrialsReport/blob/05c113f8d39dee2a02461902f0c9e1c287cad3aa/server.js#L37
router.get('/data/*?', function(req, res) {
  res.setTimeout(25000);
  var options = {
    url: 'http://cdn1.arizona.vote/' + req.originalUrl
  };
  try {
    request(options, function(error, response, body) {
      if (!error) {
        res.send(body);
      } else {
        res.send(error);
      }
    });
  } catch (e) {}
});

module.exports = router;
