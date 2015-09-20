var express = require('express');
var request = require('request');
var mustacheExpress = require('mustache-express');
var cookieSession = require('cookie-session');
var config = require('./config');
var app = express();

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(cookieSession({
  name: 'mendeley-pebble-sess',
  keys: config.session.keys
}));

app.get('/auth', function(req, res) {
  req.session.return_to = req.query.return_to || 'pebblejs://close#';

  res.redirect('https://api.mendeley.com/oauth/authorize?client_id=' + config.appId + '&redirect_uri=' + encodeURIComponent(config.redirectUri) + '&response_type=code&scope=all');
});

app.get('/auth/code', function(req, res) {
  var opts = {
    url: 'https://' + config.appId + ':' + config.appSecret + '@api.mendeley.com/oauth/token',
    'content-type': 'application/x-www-form-urlencoded',
    form: {
      'grant_type': 'authorization_code',
      code: req.query.code,
      redirect_uri: config.redirectUri
    }
  };

  request.post(opts, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.render('close', {
        redirectUrl: req.session.return_to + encodeURIComponent(JSON.stringify({
          auth: body
        }))
      });
    }
  });
});

app.get('/auth/refresh', function(req, res) {
  var opts = {
    url: 'https://' + config.appId + ':' + config.appSecret + '@api.mendeley.com/oauth/token',
    'content-type': 'application/x-www-form-urlencoded',
    form: {
      'grant_type': 'refresh_token',
      refresh_token: req.query.refresh_token,
      redirect_uri: config.redirectUri
    }
  };

  request.post(opts, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('refresh', body);
      res.json(body);
    }
  });
});

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;

  console.log('Example app listening on port', port);
});
