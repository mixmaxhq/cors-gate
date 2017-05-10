const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const Erik = require('erik');
const server = require('./spec/server');
const runSequence = require('run-sequence');

// TODO: make servers play nice when watch is enabled
const watch = ['true', '1'].indexOf(process.env.WATCH) >= 0;

gulp.task('server', function() {
  if (watch) {
    nodemon({
      script: 'spec/server.js',
      ext: 'js',
      env: {
        NODE_ENV: 'development'
      }
    });
  } else {
    server.start(true);
  }
});

new Erik({
  gulp: gulp,
  watch: watch,
  karmaConfig: {
    port: 8201,
    browsers: ['Chrome', 'Firefox', 'Safari']
  },
  taskDependencies: ['server'],
  localDependencies: [
    'spec/tests.js'
  ],
  bundlePath: 'spec'
});

gulp.task('default', ['erik']);
