const alice = 'http://localhost:9997',
  bob = 'http://localhost:9998',
  eve = 'http://localhost:9999';

describe('cors-gate', function() {
  describe('same-origin', function() {
    it('should allow image requests', function(done) {
      dispatch({
        frameSrc: alice + '/',
        type: 'image',
        url: '/api/image'
      }, done);
    });

    it('should allow GET requests', function(done) {
      dispatch({
        frameSrc: alice + '/',
        type: 'xhr',
        method: 'GET',
        url: '/api/get'
      }, done);
    });

    it('should allow POST requests', function(done) {
      dispatch({
        frameSrc: alice + '/',
        type: 'xhr',
        method: 'POST',
        url: '/api/post',
        data: 'a=b'
      }, done);
    });

    it('should allow JSON POST requests', function(done) {
      dispatch({
        frameSrc: alice + '/',
        type: 'xhr',
        method: 'POST',
        url: '/api/post',
        headers: {
          'content-type': 'application/json'
        },
        data: '{"a":"b"}'
      }, done);
    });

    if (hasBeacon())
    xit('should allow POST requests by beacon', function(done) {
      dispatch({
        frameSrc: alice + '/',
        type: 'beacon',
        url: '/api/post',
        data: '{"a":"b"}'
      }, done);
    });
  });

  describe('cross-origin', function() {
    it('should allow authorized image requests', function(done) {
      dispatch({
        frameSrc: bob + '/',
        type: 'image',
        url: alice + '/api/image'
      }, done);
    });

    it('should allow authorized GET requests', function(done) {
      dispatch({
        frameSrc: bob + '/',
        type: 'xhr',
        method: 'GET',
        url: alice + '/api/get'
      }, done);
    });

    it('should allow authorized POST requests', function(done) {
      dispatch({
        frameSrc: bob + '/',
        type: 'xhr',
        method: 'POST',
        url: alice + '/api/post',
        data: 'a=b'
      }, done);
    });

    it('should allow authorized JSON POST requests', function(done) {
      dispatch({
        frameSrc: bob + '/',
        type: 'xhr',
        method: 'POST',
        url: alice + '/api/post',
        headers: {
          'content-type': 'application/json'
        },
        data: '{"a":"b"}'
      }, done);
    });

    if (hasBeacon())
    xit('should allow authorized POST requests by beacon', function(done) {
      dispatch({
        frameSrc: bob + '/',
        type: 'beacon',
        url: alice + '/api/post',
        data: '{"a":"b"}'
      }, done);
    });

    /*it('should reject unauthorized image requests', function(done) {
      dispatch({
        frameSrc: eve + '/',
        type: 'image',
        url: alice + '/api/image'
      }, expectFailure(done));
    });

    it('should reject unauthorized GET requests', function(done) {
      dispatch({
        frameSrc: eve + '/',
        type: 'xhr',
        method: 'GET',
        url: alice + '/api/get'
      }, expectFailure(done));
    });*/

    it('should reject unauthorized POST requests', function(done) {
      dispatch({
        frameSrc: eve + '/',
        type: 'xhr',
        method: 'POST',
        url: alice + '/api/post',
        data: 'a=b'
      }, expectFailure(done));
    });

    it('should reject unauthorized JSON POST requests', function(done) {
      dispatch({
        frameSrc: eve + '/',
        type: 'xhr',
        method: 'POST',
        url: alice + '/api/post',
        headers: {
          'content-type': 'application/json'
        },
        data: '{"a":"b"}'
      }, expectFailure(done));
    });

    if (hasBeacon())
    xit('should reject unauthorized POST requests by beacon', function(done) {
      dispatch({
        frameSrc: eve + '/',
        type: 'beacon',
        url: alice + '/api/post',
        data: '{"a":"b"}'
      }, expectFailure(done));
    });
  });
});

function hasBeacon() {
  return typeof navigator.sendBeacon === 'function';
}

function expectFailure(done, message) {
  return function(err) {
    if (err) done();
    else (done.fail || done)(new Error(message || 'expected failure'));
  };
}

const pending = Object.create(null);
var nextCallbackId = 0;

function dispatch(obj, callback) {
  const id = nextCallbackId++;
  obj = Object.assign({id: id}, obj);
  const frame = document.createElement('iframe');
  pending[id] = {message: obj, frame: frame, callback: callback};
  frame.addEventListener('error', callback);
  frame.src = obj.frameSrc + '#' + id;
  frame.style.display = 'none';
  document.body.appendChild(frame);
}

const hasOwn = Object.prototype.hasOwnProperty;
function receiveMessage(event) {
  const data = event.data;

  if (data.type === 'ready') {
    const meta = pending[data.id];
    if (meta) {
      meta.frame.contentWindow.postMessage(meta.message, '*');
    } else {
      throw new Error('erroneous ready event');
    }
  } else if (data.type === 'callback') {
    const meta = pending[data.id];
    if (meta) {
      const callback = meta.callback;
      const frame = meta.frame;
      delete pending[data.id];
      frame.parentNode.removeChild(frame);
      // console.log('err', data.error);
      if (data.error) (callback.fail || callback)(data.error);
      else callback(null);
    } else {
      throw new Error('erroneous callback');
    }
  }
}

addEventListener('message', receiveMessage, false);
