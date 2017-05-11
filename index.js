const url = require('url');

/**
 * Gate requests based on CORS data. For requests that are not permitted via CORS, invoke the
 * failure options callback, which defaults to rejecting the request.
 *
 * @param {Object} options
 * @param {String} options.origin The origin of the server - requests from this origin will always
 *   proceed.
 * @param {Boolean=} options.strict Whether to reject requests that lack an Origin header. Defaults
 *   to true.
 * @param {Boolean=} options.allowSafe Whether to enforce the strict mode for safe requests (HEAD,
 *   GET). Defaults to true.
 * @param {Function=} options.failure A standard connect-style callback for handling failure.
 *   Defaults to rejecting the request with 403 Unauthorized.
 */
function corsGate(options) {
  options = Object.assign({
    strict: true,
    allowSafe: true,
    failure(req, res, next) {
      // Set `statusCode` vs. using `res#status`, as https://github.com/expressjs/cors does, so this
      // will work with any Connect-compatible server.
      res.statusCode = 403;
      res.end();
    }
  }, options);

  if (typeof options.origin !== 'string') {
    throw new Error("Must specify the server's origin.");
  }

  const thisOrigin = options.origin.toLowerCase();
  const failure = options.failure;

  return function(req, res, next) {
    const origin = (req.headers.origin || '').toLowerCase().trim();

    if (!origin) {
      // Fail on missing origin when in strict mode, but allow safe requests if allowSafe set.
      if (options.strict && (!options.allowSafe || ['GET', 'HEAD'].indexOf(req.method) === -1)) {
        return failure(req, res, next);
      }

      return next();
    }

    // Always allow same-origin requests.
    if (origin === thisOrigin) return next();

    // Now this is a cross-origin request. Check if we should allow it based on headers set by
    // previous CORS middleware. Note that `getHeader` is case-insensitive.
    const otherOrigin = (res.getHeader('access-control-allow-origin') || '').toLowerCase().trim();

    // Two values: allow any origin, or a specific origin.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Origin
    if ((otherOrigin === '*') || (origin === otherOrigin)) return next();

    // CSRF! Abort.
    failure(req, res, next);
  };
};

/**
 * Replace the Origin header with the Origin data from the Referer, if the Origin header is missing.
 * This patches Firefox's behavior as of Firefox 53, which does not send the Origin
 * header for same-origin requests.
 */
function originFallbackToReferrer() {
  return function(req, res, next) {
    const origin = (req.headers.origin || '').trim();
    if (!origin) {
      const ref = req.headers.referer;
      if (ref) {
        const parts = url.parse(ref);
        req.headers.origin = url.format({
          protocol: parts.protocol,
          host: parts.host
        });
      }
    }
    next();
  };
}

corsGate.originFallbackToReferrer = corsGate.originFallbackToReferer = originFallbackToReferrer;

module.exports = corsGate;
