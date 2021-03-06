// Generated by CoffeeScript 1.6.3
(function() {
  var Twitter, app, centerPoint, compressor, eraseTweets, express, grunt, http, id, path, routes, stream, tweets, twit, util;

  express = require('express');

  routes = require('./routes');

  http = require('http');

  path = require('path');

  util = require('util');

  compressor = require('node-minify');

  grunt = require('grunt');

  twit = require('twit');

  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.tasks([], {}, function() {
    return grunt.log.ok("Grunt: Done running tasks!");
  });

  app = express();

  app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    return app.use(express["static"](path.join(__dirname, "public")));
  });

  new compressor.minify({
    type: 'uglifyjs',
    fileIn: 'assets/js/fBomb.js',
    fileOut: 'public/js/fBomb.min.js',
    callback: function(err) {
      if (err) {
        return console.log('minify: ' + err);
      }
    }
  });

  new compressor.minify({
    type: 'yui-css',
    fileIn: 'public/css/add2home.css',
    fileOut: 'public/css/add2home.min.css',
    callback: function(err) {
      if (err) {
        return console.log('minify: ' + err);
      }
    }
  });

  app.configure('development', function() {
    app.use(express.logger('dev'));
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return app.locals.pretty = true;
  });

  app.configure('production', function() {
    app.use(express.logger());
    return app.use(express.errorHandler());
  });

  Twitter = new twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.oauth_token,
    access_token_secret: process.env.oauth_token_secret
  });

  tweets = [];

  eraseTweets = function() {
    return tweets = [];
  };

  setInterval(eraseTweets, 5000);

  getTweets = function() {return tweets;};

  stream = Twitter.stream('statuses/filter', {
    track: process.env.track
  });

  id = 0;

  stream.on('tweet', function(tweet) {
    if (tweet.coordinates) {
      return tweets.push({
        text: "@" + tweet.user.screen_name + " : " + tweet.text,
        coordinates: tweet.coordinates.coordinates,
        id: id++
      });
    } else if (tweet.place) {
      if (tweet.place.bounding_box) {
        if (tweet.place.bounding_box.type === 'Polygon') {
          return centerPoint(tweet.place.bounding_box.coordinates[0], function(center) {
            return tweets.push({
              text: "@" + tweet.user.screen_name + " : " + tweet.text,
              coordinates: center,
              id: id++
            });
          });
        } else {
          return console.log('WTF_Place: ' + util.inspect(tweet.place));
        }
      } else {
        return console.log('placeWithNoBoundingBox' + util.inspect(tweet.place));
      }
    }
  });

  stream.on('limit', function(limitMessage) {
    console.log("mgingras (limit): ");
    return console.log(limitMessage);
  });

  stream.on('warning', function(warning) {
    console.log("mgingras (warning): ");
    return console.log(warning);
  });

  stream.on('disconnect', function(disconnectMessage) {
    console.log("mgingras (disconnect): ");
    return console.log(disconnectMessage);
  });

  stream.on('reconnect', function(req, res, connectInterval) {
    console.log("mgingras (reconnect): ");
    console.log("Reqeuest: ");
    console.log(req);
    console.log("Response: ");
    console.log(res);
    console.log("Connection Interval: ");
    return console.log(connectInterval);
  });

  centerPoint = function(coords, callback) {
    var centerPointX, centerPointY, coord, _i, _len;
    centerPointX = 0;
    centerPointY = 0;
    for (_i = 0, _len = coords.length; _i < _len; _i++) {
      coord = coords[_i];
      centerPointX += coord[0];
      centerPointY += coord[1];
    }
    return callback([centerPointX / coords.length, centerPointY / coords.length]);
  };

  app.get('/', routes.index);

  app.get('/data', routes.data);

  http.createServer(app).listen(app.get('port'), function() {
    return console.log('Express server listening on port ' + app.get('port'));
  });

  process.on('uncaughtException', function(err) {
    return console.log('Uncaught Error!!! : ' + err);
  });

}).call(this);
