cors-gate
=========

[![Build Status](https://travis-ci.org/mixmaxhq/cors-gate.svg?branch=master)](https://travis-ci.org/mixmaxhq/cors-gate)

Connect-compatible middleware to selectively reject requests based on CORS rules.

Install
-------

Run this in your project:

```sh
$ yarn add cors-gate
```

Test
----

```sh
$ yarn test
```

Usage
-----

```js
const express = require('express');
const cors = require('cors');
const corsGate = require('cors-gate');

const app = express();

app.use(cors({
  origin: ['https://app.mixmax.com', 'https://other-app.mixmax.com'],
  credentials: true
}));

// prevent cross-origin requests from domains not permitted by the preceeding cors rules
app.use(corsGate({
  // require an Origin header, and reject request if missing
  strict: true,
  // permit GET and HEAD requests, even without an Origin header
  allowSafe: true,
  // the origin of the server
  origin: 'https://api.mixmax.com'
}));

// add a new contact
app.post('/api/contacts', function(req, res) {
  // ...
  res.status(200).json({id: id});
});
```

### Firefox and the Origin header

Firefox does not set the `Origin` header [on same-origin requests](http://stackoverflow.com/a/15514049/495611) (see also [csrf-request-tester](https://github.com/mixmaxhq/csrf-request-tester)). Firefox does, however, send a `Referer` header. Use `corsGate.originFallbackToReferrer` to fill the `Origin` header from `Referer` if when missing. Note that this should be used prior to `cors` to ensure that it sets the `Access-Control-Allow-Origin` header appropriately.

```js
app.use(corsGate.originFallbackToReferrer());
app.use(cors({ ... }));
app.use(corsGate({ ... }));
```

License
-------

The [MIT License](https://github.com/mixmaxhq/cors-gate/blob/master/LICENSE).
