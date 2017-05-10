const bodyParser = require('body-parser');
const express = require('express');
// const request = require('request');
const cors = require('cors');
const url = require('url');
const useragent = require('useragent');
const emptygif = require('emptygif');

const corsGate = require('..');

const alice = express();
const bob = express();
const eve = express();

[alice, bob, eve].forEach((app) => {
  app.set('views', __dirname + '/templates');
  app.set('view engine', 'hbs');

  // Used to verify that `navigator.sendBeacon` can POST JSON even without preflighting.
  app.use(bodyParser.json());

  // Disable caching for all responses.
  app.use(function(req, res, next) {
    // if (req.url !== '/') console.log(req.method, req.query.id, req.url);
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

  // Make sure that we can still use the Origin header with the referrer disabled.
  app.use((req, res, next) => {
    const agent = useragent.parse(req.get('user-agent'));
    if (agent.family === 'Firefox') {
      // allows us to interpret the referer as the origin
      res.set('referrer-policy', 'strict-origin');
    } else if (agent.family === 'Safari') {
      res.locals.metaReferrer = true;
    } else {
      res.set('referrer-policy', 'no-referrer');
    }
    next();
  });

  app.disable('x-powered-by');

  app.get('/', (req, res) => {
    res.render('proxy-page');
  });
});

const lockDown = [
  // We must update the origin correctly here so that the access-control-allow-origin response
  // header correctly reflects whether the request should be allowed.
  corsGate.originFallbackToReferrer(),
  cors({
    origin: ['http://localhost:9997', 'http://localhost:9998'],
    credentials: true
  }),
  corsGate({
    origin: 'http://localhost:9997',
    strict: false,
    allowSafe: true
  })
];

alice.use('/api', lockDown, (req, res) => {
  if (req.path.endsWith('image')) {
    // We send a real image so that the image error handler will reflect whether the server rejected
    // the response.
    emptygif.sendEmptyGif(req, res, {
      'Content-Type': 'image/gif',
      'Content-Length': emptygif.emptyGifBufferLength,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0' // Never cache.
    });
  } else {
    res.end()
  }
});

var servers = [];

function start(unref) {
  servers.push(
    alice.listen(9997),
    bob.listen(9998),
    eve.listen(9999));

  if (unref) {
    servers.forEach(function(server) {
      server.unref();
    });
  }
}

function stop() {
  servers.forEach(function(server) {
    server.close();
  });
}

exports.start = start;
exports.stop = stop;

if (require.main === module) start();
