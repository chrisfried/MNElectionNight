var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');

router.get('/', function(req, res) {
  res.render('index');
});

var cache = {};

rand =
  // Courtesy of https://github.com/DestinyTrialsReport/DestinyTrialsReport/blob/05c113f8d39dee2a02461902f0c9e1c287cad3aa/server.js#L37
  router.get('/Results/*?', function(req, res) {
    if (cache[req.originalUrl]) {
      res.send(cache[req.originalUrl]);
    } else {
      res.setTimeout(25000);
      var options = {
        url: 'http://electionresults.sos.state.mn.us/' + req.originalUrl
      };
      try {
        request(options, function(error, response, body) {
          if (!error) {
            cache[req.originalUrl] = body;
            var wait = Math.floor(Math.random() * 30000) + 30000;
            setTimeout(() => (cache[req.originalUrl] = null), wait);
            res.send(body);
          } else {
            res.send(error);
          }
        });
      } catch (e) {}
    }
  });

module.exports = router;
