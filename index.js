module.exports = function(thisOrigin) {
  if (!thisOrigin) throw new Error('Must specify the server\'s origin.');
  thisOrigin = thisOrigin.toLowerCase();

  return function(req, res, next) {
    const origin = (req.headers.origin || '').toLowerCase().trim();

    // The `origin` header will always be sent for browsers that support CORS:
    // https://developer.mozilla.org/en/docs/HTTP/Access_control_CORS#Origin
    // If the header is missing, this is not a browser request and thus we shouldn't
    // do anything (there's no risk of CSRF).
    if (!origin) return next();

    // Always allow same-origin requests.
    if (origin === thisOrigin) return next();

    // Now this is a cross-origin request. Check if we should allow it based on headers set by
    // previous CORS middleware. Note that `getHeader` is case-insensitive.
    const otherOrigin = (res.getHeader('access-control-allow-origin') || '').toLowerCase().trim();

    // Two values: allow any origin, or a specific origin.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Origin
    if ((otherOrigin === '*') || (origin === otherOrigin)) return next();

    // CSRF! Abort. Set `statusCode` vs. using `res#status`, as https://github.com/expressjs/cors does,
    // so this will work with any Connect-compatible server.
    res.statusCode = 403;
    res.end();
  };
};
